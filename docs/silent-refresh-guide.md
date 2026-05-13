# Silent Refresh Implementation Guide

This guide is for learning by doing. It explains how to implement silent refresh in this project step by step, without relying on an AI agent to write the code for you.

Your current auth foundation is already close to the industry-standard approach:

- The backend creates an `accessToken` and a `refreshToken`.
- Both tokens are stored in `httpOnly` cookies.
- The access token expires quickly.
- The refresh token lasts longer.
- The frontend does not manually read tokens.

The goal now is to teach your app how to refresh the access token silently when it expires.

---

## 1. Understand The Problem

Right now, after login, your backend sets two cookies:

- `accessToken`
- `refreshToken`

The access token is short-lived:

```ts
expiresIn: "15m"
```

That means after 15 minutes, protected API requests should fail with `401 Unauthorized`.

Without silent refresh, the user would need to log in again.

With silent refresh, the app does this instead:

1. User makes a protected API request.
2. Backend says the access token is expired.
3. Frontend quietly calls a refresh endpoint.
4. Backend validates the refresh token.
5. Backend creates new tokens and resets cookies.
6. Frontend retries the original request.
7. User never notices anything happened.

That is silent refresh.

---

## 2. Final Architecture

The industry-standard flow should look like this:

```txt
Login
  -> validate credentials
  -> create access token
  -> create refresh token
  -> store refresh token on user document
  -> set both tokens as httpOnly cookies

Protected API request
  -> read accessToken cookie
  -> verify access token
  -> allow request if valid
  -> return 401 if missing/expired/invalid

Refresh request
  -> read refreshToken cookie
  -> verify refresh token
  -> find user
  -> compare request refresh token with user's stored refresh token
  -> create new access token and new refresh token
  -> save new refresh token in database
  -> set new cookies

Logout
  -> clear user's refresh token in database
  -> clear accessToken cookie
  -> clear refreshToken cookie
```

---

## 3. Important Rule: Do Not Store Tokens In Redux Or Local Storage

Because your tokens are already in `httpOnly` cookies, keep them there.

Do not do this:

```ts
localStorage.setItem("accessToken", token)
localStorage.setItem("refreshToken", token)
```

Do not do this either:

```ts
state.accessToken = token
state.refreshToken = token
```

Your frontend should not read the tokens.

The browser automatically sends cookies to your Next.js API routes. The backend reads and verifies them.

This is better because `httpOnly` cookies cannot be accessed by client-side JavaScript.

---

## 4. Fix Token Lifetime Consistency

Open:

```txt
app/models/user.model.ts
```

You currently create refresh tokens with:

```ts
expiresIn: "7d"
```

Now open:

```txt
app/api/v1/auth/login/route.ts
app/api/v1/auth/verify-user/route.ts
```

Your refresh cookie currently uses:

```ts
maxAge: 24 * 60 * 60
```

That is only 1 day.

This means:

```txt
Refresh JWT lifetime: 7 days
Refresh cookie lifetime: 1 day
```

That mismatch is confusing.

Choose one policy. For learning, use:

```txt
Access token: 15 minutes
Refresh token: 7 days
```

So your refresh cookie should eventually use:

```ts
maxAge: 7 * 24 * 60 * 60
```

Checkpoint:

- Access token cookie lifetime should match access token JWT lifetime.
- Refresh token cookie lifetime should match refresh token JWT lifetime.

---

## 5. Create A Token/Cookie Helper

Before creating refresh and logout endpoints, reduce duplication.

Create a helper file:

```txt
app/utils/auth-cookie.utils.ts
```

This file should contain shared cookie logic.

Recommended constants:

```ts
export const ACCESS_TOKEN_MAX_AGE = 15 * 60
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60
```

Recommended helper:

```ts
export const setAuthCookies = (
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) => {
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  })
}
```

Also add a helper to clear cookies:

```ts
export const clearAuthCookies = (response: NextResponse) => {
  response.cookies.set("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  })

  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  })
}
```

Why this matters:

- Login, verify-user, refresh, and logout should all use the same cookie settings.
- If you need to change cookie behavior later, you change it in one place.

Checkpoint:

- Login route still works.
- Verify-user route still works.
- Cookies are still created after login/verification.

---

## 6. Create A JWT Verification Helper

Create:

```txt
app/utils/auth-token.utils.ts
```

This file should verify tokens.

You need two functions:

```ts
verifyAccessToken(token)
verifyRefreshToken(token)
```

Conceptually:

```ts
import jwt from "jsonwebtoken"

export const verifyAccessToken = (token: string) => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is missing")
  }

  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
}

export const verifyRefreshToken = (token: string) => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is missing")
  }

  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
}
```

Later, you can type the decoded payload more strictly.

For now, understand that `jwt.verify()` can throw errors:

- Token missing
- Token expired
- Token malformed
- Token signed with wrong secret

Checkpoint:

- Your code should treat failed token verification as an auth failure.
- Failed verification should return `401`, not `500`.

---

## 7. Create The Refresh Endpoint

Create:

```txt
app/api/v1/auth/refresh-token/route.ts
```

Use `POST`.

Why `POST`?

Refreshing changes server state because you should rotate the refresh token.

The flow should be:

```txt
1. Connect to database.
2. Read refreshToken from request.cookies.
3. If missing, return 401.
4. Verify refresh token using REFRESH_TOKEN_SECRET.
5. Get user _id from decoded token.
6. Find user by _id.
7. If user not found, return 401.
8. Compare incoming refresh token with user.refreshToken.
9. If mismatch, clear cookies and return 401.
10. Generate new access token and refresh token.
11. Save new refresh token to user.
12. Set both cookies.
13. Return success.
```

The most important part:

```txt
Compare incoming refreshToken with user.refreshToken
```

Why?

Because refresh tokens should be revocable.

If the user logs out, you clear `user.refreshToken`.

If someone tries to use an old refresh token after rotation, it should fail.

Recommended response:

```ts
return NextResponse.json(
  { success: true, message: "Session refreshed." },
  { status: 200 }
)
```

Do not return tokens in the response body.

The tokens should only be sent as cookies.

Checkpoint:

- If refresh token exists and is valid, new cookies are set.
- If refresh token is missing, response is `401`.
- If refresh token is invalid, response is `401`.
- If refresh token does not match database value, response is `401` and cookies are cleared.

---

## 8. Understand Refresh Token Rotation

Refresh token rotation means this:

```txt
Every refresh request creates a new refresh token.
The old refresh token becomes invalid.
```

Example:

```txt
Login creates refresh token A.
Database stores A.

Refresh request sends A.
Backend verifies A.
Backend creates refresh token B.
Database stores B.
Browser receives B.

If someone tries to use A again, it fails.
```

This protects users if an old refresh token somehow leaks.

For your current app, `generateAccessAndRefreshToken()` already creates and saves a new refresh token:

```txt
app/utils/generateAccessAndRefreshToken.utils.ts
```

So your refresh endpoint can reuse it.

Checkpoint:

- Refreshing twice should produce a new refresh cookie each time.
- The old refresh token should not remain valid after a newer one is saved.

---

## 9. Create The Logout Endpoint

Create:

```txt
app/api/v1/auth/logout/route.ts
```

Use `POST`.

Flow:

```txt
1. Read refreshToken from request.cookies.
2. If token exists, verify it if possible.
3. Find the user.
4. Set user.refreshToken = null or "".
5. Save user.
6. Clear accessToken cookie.
7. Clear refreshToken cookie.
8. Return success.
```

Even if token verification fails, still clear cookies.

Logout should be forgiving.

Recommended response:

```ts
return NextResponse.json(
  { success: true, message: "Logged out successfully." },
  { status: 200 }
)
```

Checkpoint:

- After logout, browser cookies should be gone.
- After logout, `user.refreshToken` in MongoDB should be empty.
- Calling refresh after logout should fail with `401`.

---

## 10. Create The Current User Endpoint

Create:

```txt
app/api/v1/auth/me/route.ts
```

Use `GET`.

This endpoint answers:

```txt
Who is currently logged in?
```

Flow:

```txt
1. Read accessToken from request.cookies.
2. If missing, return 401.
3. Verify access token.
4. Get user _id from decoded token.
5. Find user by _id.
6. Exclude sensitive fields.
7. Return safe user data.
```

Never return:

- `password`
- `refreshToken`
- `otp`
- `otpExpiry`

Safe response shape:

```ts
{
  success: true,
  data: {
    user: {
      _id: "...",
      firstName: "...",
      lastName: "...",
      userName: "...",
      email: "...",
      phone: "...",
      isVerified: true
    }
  }
}
```

Checkpoint:

- When access token is valid, `/me` returns user data.
- When access token is expired, `/me` returns `401`.
- `/me` should not refresh tokens itself.

Why `/me` should not refresh automatically:

- It keeps responsibilities clear.
- `/me` checks authentication.
- `/refresh-token` renews authentication.

---

## 11. Create A Protected API Pattern

Any protected API route should follow this idea:

```txt
1. Read accessToken cookie.
2. Verify access token.
3. If invalid, return 401.
4. Continue request.
```

Do not use the refresh token for normal protected APIs.

The refresh token should only be used by:

```txt
/api/v1/auth/refresh-token
/api/v1/auth/logout
```

This separation matters because refresh tokens are powerful. Keep their usage narrow.

---

## 12. Update Redux Auth State

Open:

```txt
lib/slices/auth.slice.ts
```

Right now your state has:

```ts
user: User | null
loading: boolean
error: string
message: string
```

For silent refresh, it is useful to add:

```ts
isAuthenticated: boolean
initialized: boolean
```

Recommended meaning:

```txt
user
  The logged-in user data, or null.

isAuthenticated
  true when the app knows the user is logged in.

initialized
  true after the app has checked whether a session exists.
```

Why `initialized` matters:

When the app first loads, Redux state starts empty.

But empty state does not always mean logged out.

The user may have valid cookies.

So the app needs to check `/me` before deciding what to show.

Without `initialized`, your UI may briefly show the wrong page.

Checkpoint:

- Login success should eventually set `isAuthenticated = true`.
- Logout success should set `user = null` and `isAuthenticated = false`.
- Session check completion should set `initialized = true`.

---

## 13. Add Auth Thunks

Open:

```txt
lib/features/auth.feature.ts
```

Add thunks for:

```txt
refreshTokenHandler
logoutUserHandler
getCurrentUserHandler
```

Expected endpoints:

```txt
POST /api/v1/auth/refresh-token
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

For cookie-based auth, normal fetch is enough:

```ts
fetch("/api/v1/auth/me")
```

Because this is same-origin, cookies are included automatically.

If you ever call a separate backend domain, you would need:

```ts
credentials: "include"
```

But for your current Next.js API routes, same-origin cookies should work by default.

Checkpoint:

- `getCurrentUserHandler` returns user data when logged in.
- `refreshTokenHandler` succeeds when refresh cookie is valid.
- `logoutUserHandler` clears auth state.

---

## 14. Create An Auth Fetch Wrapper

Create:

```txt
lib/api/authFetch.ts
```

This wrapper teaches your frontend how to retry after access token expiry.

Basic behavior:

```txt
1. Make the original request.
2. If response is not 401, return it.
3. If response is 401, call /api/v1/auth/refresh-token.
4. If refresh succeeds, retry the original request once.
5. If refresh fails, treat user as logged out.
```

Pseudo-code:

```ts
export const authFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
) => {
  const response = await fetch(input, init)

  if (response.status !== 401) {
    return response
  }

  const refreshResponse = await fetch("/api/v1/auth/refresh-token", {
    method: "POST",
  })

  if (!refreshResponse.ok) {
    return response
  }

  return fetch(input, init)
}
```

This is the beginner version.

It works, but there is one issue:

If many requests fail at once, they may all call refresh.

You will fix that in the next step.

Checkpoint:

- Protected API request works when access token is valid.
- If access token is expired but refresh token is valid, the original request is retried.
- If refresh token is invalid, original `401` remains.

---

## 15. Add Single-Flight Refresh

Problem:

Imagine your dashboard loads 5 protected APIs at once.

If the access token expired, all 5 requests return `401`.

Without protection, all 5 requests call:

```txt
/api/v1/auth/refresh-token
```

That is bad because refresh token rotation means the first request changes the refresh token.

The other 4 requests may still be using the old refresh token and fail.

Solution:

Use one shared refresh promise.

Concept:

```ts
let refreshPromise: Promise<Response> | null = null
```

Pseudo-code:

```ts
const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/v1/auth/refresh-token", {
      method: "POST",
    }).finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}
```

Then inside `authFetch`:

```txt
If original request returns 401:
  wait for refreshSession()
  if refresh succeeded:
    retry original request once
```

This pattern is called:

```txt
single-flight refresh
```

Checkpoint:

- Multiple failed requests should trigger only one refresh request.
- After refresh succeeds, all waiting requests should retry.

---

## 16. Prevent Infinite Retry Loops

Your `authFetch` should retry only once.

Bad flow:

```txt
Request fails 401
Refresh succeeds
Retry request
Retry also fails 401
Refresh again
Retry again
Refresh again
...
```

Avoid this by tracking whether the request already retried.

Simple mental model:

```txt
Original request gets one retry after refresh.
If retry still fails, return the failed response.
```

Checkpoint:

- A protected API should never loop forever.
- Failed auth should eventually redirect to login or show logged-out state.

---

## 17. Add App Startup Session Check

When the user reloads the page, Redux state resets.

But cookies may still exist.

So the app needs to ask:

```txt
Am I already logged in?
```

Recommended startup flow:

```txt
1. Call /api/v1/auth/me.
2. If success, store user in Redux.
3. If /me returns 401, call /api/v1/auth/refresh-token.
4. If refresh succeeds, call /me again.
5. If refresh fails, mark initialized and logged out.
```

This can live in a client component near your Redux provider.

Possible file idea:

```txt
app/components/auth/auth-session-provider.tsx
```

It should run once when the app mounts.

Concept:

```ts
useEffect(() => {
  dispatch(initializeAuthSession())
}, [dispatch])
```

Where `initializeAuthSession` is a thunk that performs:

```txt
/me -> refresh if needed -> /me again
```

Checkpoint:

- Refresh the browser after login.
- User should remain logged in.
- Redux should be repopulated from `/me`.

---

## 18. Protect Dashboard Routes

You currently have:

```txt
app/(pages)/dashboard/page.tsx
```

Eventually this page should only be visible to authenticated users.

There are two common approaches:

### Option A: Client-Side Protection

Use Redux state:

```txt
If initialized is false -> show loading
If initialized is true and isAuthenticated is false -> redirect to /auth/login
If authenticated -> show dashboard
```

This is easier for learning.

### Option B: Middleware Protection

Create:

```txt
middleware.ts
```

Middleware can check cookies before rendering protected pages.

But middleware has limitations:

- It should stay lightweight.
- It cannot easily query MongoDB in the same way as API routes.
- It is better for basic cookie existence checks, not full session validation.

For your first implementation, use client-side protection first.

Later, improve with middleware if needed.

Checkpoint:

- Logged-out users should not stay on `/dashboard`.
- Logged-in users should access `/dashboard`.
- Reloading `/dashboard` should not immediately kick out a valid session.

---

## 19. Login Flow After Silent Refresh

Open:

```txt
app/components/forms/login.form.tsx
```

After successful login, you should eventually redirect:

```ts
router.push("/dashboard")
```

Recommended flow:

```txt
1. Submit login form.
2. Backend sets cookies.
3. Frontend calls /me or receives user data from login.
4. Redux marks user authenticated.
5. Redirect to dashboard.
```

For a clean design, login can either:

- Return safe user data directly, or
- Set cookies and let frontend call `/me`.

For learning, the second approach is very clear:

```txt
Login succeeds -> call /me -> set Redux user -> redirect
```

Checkpoint:

- Login creates cookies.
- User state is filled.
- User is redirected to dashboard.

---

## 20. Manual Testing Plan

For testing, temporarily reduce access token expiry.

In:

```txt
app/models/user.model.ts
```

Temporarily change:

```ts
expiresIn: "15m"
```

to:

```ts
expiresIn: "30s"
```

Do not keep this in production.

Then test:

```txt
1. Login.
2. Open browser DevTools.
3. Check cookies exist.
4. Call /api/v1/auth/me.
5. Wait 30 seconds.
6. Call a protected API again.
7. Confirm it gets refreshed silently.
8. Confirm new cookies are set.
9. Logout.
10. Confirm refresh no longer works.
```

Things to inspect in DevTools:

- Network tab
- Cookies tab
- Status codes
- `Set-Cookie` response headers

Expected behavior:

```txt
Before access expiry:
  /me -> 200

After access expiry:
  /me -> 401
  /refresh-token -> 200
  /me retry -> 200

After logout:
  /me -> 401
  /refresh-token -> 401
```

---

## 21. Common Mistakes

### Mistake 1: Returning Tokens In JSON

Avoid:

```ts
return NextResponse.json({ accessToken, refreshToken })
```

Prefer:

```txt
Set tokens as httpOnly cookies.
Return only success/message/user data.
```

### Mistake 2: Using Refresh Token For Protected APIs

Avoid:

```txt
If access token fails, protected API directly accepts refresh token.
```

Prefer:

```txt
Protected API only accepts access token.
Refresh endpoint accepts refresh token.
```

### Mistake 3: No Refresh Token Rotation

Avoid:

```txt
Refresh endpoint keeps reusing the same refresh token forever.
```

Prefer:

```txt
Every refresh creates a new refresh token.
```

### Mistake 4: Multiple Refresh Calls At Once

Avoid:

```txt
5 failed API calls -> 5 refresh requests
```

Prefer:

```txt
5 failed API calls -> 1 shared refresh request
```

### Mistake 5: Treating Initial Empty Redux State As Logged Out

Avoid:

```txt
user is null -> redirect immediately
```

Prefer:

```txt
initialized is false -> check session first
initialized is true and user is null -> redirect
```

---

## 22. Suggested Implementation Order

Follow this order exactly if this is your first time:

```txt
1. Align refresh cookie maxAge with refresh JWT expiry.
2. Create auth cookie helper.
3. Refactor login route to use cookie helper.
4. Refactor verify-user route to use cookie helper.
5. Create token verification helper.
6. Create /api/v1/auth/refresh-token.
7. Test refresh endpoint manually.
8. Create /api/v1/auth/logout.
9. Test logout manually.
10. Create /api/v1/auth/me.
11. Test /me manually.
12. Add Redux auth state fields.
13. Add current user, refresh, and logout thunks.
14. Create authFetch.
15. Add single-flight refresh to authFetch.
16. Add startup session check.
17. Protect dashboard.
18. Add login redirect.
19. Temporarily reduce access token expiry to 30s.
20. Test full flow.
21. Restore access token expiry to 15m.
```

---

## 23. Final Expected User Experience

When everything is working:

```txt
User logs in.
User goes to dashboard.
Access token expires after 15 minutes.
User clicks around normally.
Frontend silently refreshes the session.
User stays logged in.
User refreshes browser.
App restores session from cookies.
User logs out.
Cookies are cleared.
Refresh token in database is cleared.
User cannot silently refresh anymore.
```

That is the behavior you are aiming for.

---

## 24. Production Improvements For Later

After you understand the basic version, improve it with these:

- Store a hashed refresh token in MongoDB instead of the raw token.
- Add device/session table instead of one `refreshToken` field on the user.
- Allow users to log out from one device or all devices.
- Add rate limiting to login and refresh endpoints.
- Add CSRF protection if you later support cross-site cookie usage.
- Add audit fields like `lastLoginAt`, `lastRefreshAt`, and `lastLogoutAt`.
- Add token versioning so password change can invalidate old sessions.

Do not start with all of these. First make the simple version work end to end.

