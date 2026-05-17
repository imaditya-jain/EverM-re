# Silent Refresh Frontend Guide

This guide starts from step 12 of `docs/silent-refresh-guide.md`.

You have already built the main backend pieces:

- `POST /api/v1/auth/refresh-token`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- Cookie helpers
- Token verification helpers

Now the frontend needs to learn three things:

1. How to remember auth state in Redux.
2. How to restore a session after page refresh.
3. How to silently refresh the access token and retry the failed request.

This guide explains the flow slowly and practically.

---

## 1. The Two Important State Fields

You are confused about these:

```ts
isAuthenticated: boolean
initialized: boolean
```

That is normal. They sound similar, but they answer different questions.

### `isAuthenticated`

This means:

```txt
Is the user logged in?
```

Examples:

```ts
isAuthenticated: true
```

means:

```txt
The app knows the user is logged in.
```

```ts
isAuthenticated: false
```

means:

```txt
The app does not have a logged-in user.
```

### `initialized`

This means:

```txt
Has the app finished checking whether the user is logged in?
```

This exists because Redux starts empty after a browser refresh.

When the page first loads, Redux does not know anything yet:

```ts
user: null
isAuthenticated: false
initialized: false
```

But the browser may still have valid `httpOnly` cookies.

So the app must ask the backend:

```txt
GET /api/v1/auth/me
```

Until that check finishes, `initialized` should stay `false`.

---

## 2. All Possible State Conditions

### Condition 1: App Is Still Checking Session

```ts
initialized: false
isAuthenticated: false
user: null
```

Meaning:

```txt
The app just opened.
Redux is empty.
The app has not checked /me yet.
Do not redirect yet.
Show loading.
```

Example:

```txt
User refreshes /dashboard.
Cookies may exist.
Redux is empty.
App is checking session.
```

UI behavior:

```txt
Show "Checking session..."
```

Do not redirect to login yet.

---

### Condition 2: App Checked And User Is Logged In

```ts
initialized: true
isAuthenticated: true
user: {...}
```

Meaning:

```txt
The app checked the backend.
The user is logged in.
User data is available.
```

Example:

```txt
/me returned success.
```

UI behavior:

```txt
Show dashboard or protected page.
```

---

### Condition 3: App Checked And User Is Logged Out

```ts
initialized: true
isAuthenticated: false
user: null
```

Meaning:

```txt
The app checked the backend.
No valid session exists.
```

Example:

```txt
No cookies.
Access token expired.
Refresh token expired.
User logged out.
```

UI behavior:

```txt
Redirect protected pages to /auth/login.
```

---

### Condition 4: Usually Avoid This

```ts
initialized: false
isAuthenticated: true
```

Meaning:

```txt
The app says user is logged in before session checking is complete.
```

This state is confusing. Avoid it.

If you know the user is authenticated, then initialization is also complete:

```ts
initialized: true
isAuthenticated: true
```

---

## 3. Your Current Slice Problem

Open:

```txt
lib/slices/auth.slice.ts
```

You already added these fields to the interface:

```ts
isAuthenticated: boolean;
initialized: boolean;
```

But your `initialState` currently does not include them.

Your initial state should conceptually become:

```ts
const initialState: InitialStateTypes = {
  user: null,
  loading: false,
  error: "",
  message: "",
  isAuthenticated: false,
  initialized: false,
}
```

Why?

At first app load:

```txt
We do not know if the user is logged in yet.
```

So:

```ts
initialized: false
```

And because we do not have user data yet:

```ts
isAuthenticated: false
user: null
```

---

## 4. What Should Update These States?

Different actions should update state differently.

### Login Success

Your login endpoint sets cookies but does not currently return user data.

So after login, the clean flow is:

```txt
1. loginUserHandler succeeds.
2. Browser now has auth cookies.
3. Call getCurrentUserHandler.
4. /me returns user.
5. Redux stores user.
6. isAuthenticated = true.
7. initialized = true.
```

State after login is fully complete:

```ts
user: userData
isAuthenticated: true
initialized: true
loading: false
```

### `/me` Success

When `GET /api/v1/auth/me` succeeds:

```ts
user = action.payload.data.user
isAuthenticated = true
initialized = true
loading = false
```

This means:

```txt
We checked the session and found a logged-in user.
```

### `/me` Failure

When `/me` fails with `401`, it does not always mean final logout.

It can mean:

```txt
Access token expired, but refresh token may still work.
```

So for app startup, do not immediately mark the user logged out after `/me` fails.

Instead, try:

```txt
POST /api/v1/auth/refresh-token
```

Then call `/me` again.

Only after refresh also fails should you mark:

```ts
user = null
isAuthenticated = false
initialized = true
```

### Refresh Success

When refresh succeeds:

```txt
Cookies were updated by the backend.
```

But refresh response does not return user data.

So Redux should not set `user` from refresh response.

Instead:

```txt
refresh success -> call /me -> store user
```

### Refresh Failure

When refresh fails:

```ts
user = null
isAuthenticated = false
initialized = true
```

This means:

```txt
The session cannot be restored.
The user must log in again.
```

### Logout Success

When logout succeeds:

```ts
user = null
isAuthenticated = false
initialized = true
loading = false
```

Why `initialized: true`?

Because after logout, the app knows the answer:

```txt
The user is not authenticated.
```

---

## 5. Add The Missing Auth Thunks

Open:

```txt
lib/features/auth.feature.ts
```

You need these thunks:

```ts
getCurrentUserHandler
refreshTokenHandler
logoutUserHandler
initializeAuthSessionHandler
```

The first three call API routes directly.

The fourth is a higher-level workflow.

---

## 6. `getCurrentUserHandler`

This calls:

```txt
GET /api/v1/auth/me
```

Purpose:

```txt
Ask backend who the current user is.
```

Pseudo-code:

```ts
export const getCurrentUserHandler = createAsyncThunk<
  ApiResponse,
  void,
  { rejectValue: RejectError }
>("auth/me", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/v1/auth/me", {
      method: "GET",
    })

    const result: ApiResponse = await response.json()

    if (!response.ok) {
      return rejectWithValue({
        success: false,
        error: result.error || "User is not authenticated.",
      })
    }

    return result
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue({ success: false, error: error.message })
    }

    return rejectWithValue({ success: false, error: "Something went wrong." })
  }
})
```

Expected success result:

```ts
{
  success: true,
  data: {
    user: {...}
  }
}
```

Reducer behavior:

```txt
pending:
  loading = true

fulfilled:
  user = payload.data.user
  isAuthenticated = true
  initialized = true
  loading = false

rejected:
  Do not always set initialized here if this thunk is used inside startup.
```

This last point is important. `/me` failure may be followed by refresh.

---

## 7. `refreshTokenHandler`

This calls:

```txt
POST /api/v1/auth/refresh-token
```

Purpose:

```txt
Ask backend to create fresh auth cookies using the refresh token.
```

Pseudo-code:

```ts
export const refreshTokenHandler = createAsyncThunk<
  ApiResponse,
  void,
  { rejectValue: RejectError }
>("auth/refresh-token", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/v1/auth/refresh-token", {
      method: "POST",
    })

    const result: ApiResponse = await response.json()

    if (!response.ok) {
      return rejectWithValue({
        success: false,
        error: result.error || "Session refresh failed.",
      })
    }

    return result
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue({ success: false, error: error.message })
    }

    return rejectWithValue({ success: false, error: "Something went wrong." })
  }
})
```

Reducer behavior:

```txt
fulfilled:
  Do not set user.
  Do not assume authentication from only refresh if you want user data.
  Usually call /me after refresh.

rejected:
  user = null
  isAuthenticated = false
```

Important:

```txt
Refresh only renews cookies.
/me gives the frontend user data.
```

---

## 8. `logoutUserHandler`

This calls:

```txt
POST /api/v1/auth/logout
```

Purpose:

```txt
Clear cookies and clear refresh token in database.
```

Pseudo-code:

```ts
export const logoutUserHandler = createAsyncThunk<
  ApiResponse,
  void,
  { rejectValue: RejectError }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/v1/auth/logout", {
      method: "POST",
    })

    const result: ApiResponse = await response.json()

    if (!response.ok) {
      return rejectWithValue({
        success: false,
        error: result.error || "Logout failed.",
      })
    }

    return result
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue({ success: false, error: error.message })
    }

    return rejectWithValue({ success: false, error: "Something went wrong." })
  }
})
```

Reducer behavior:

```txt
fulfilled:
  user = null
  isAuthenticated = false
  initialized = true
  loading = false
```

---

## 9. The Most Important Thunk: Initialize Session

This is the part that usually makes everything click.

When your app opens, run this flow:

```txt
Try /me.

If /me succeeds:
  User is authenticated.

If /me fails:
  Try /refresh-token.

If refresh succeeds:
  Try /me again.

If second /me succeeds:
  User is authenticated.

If refresh fails or second /me fails:
  User is logged out.
```

In plain language:

```txt
First ask "Who am I?"
If access token is expired, ask "Can I renew my session?"
If renewal works, ask "Who am I?" again.
```

Pseudo-code:

```ts
export const initializeAuthSessionHandler = createAsyncThunk<
  ApiResponse,
  void,
  { rejectValue: RejectError }
>("auth/initialize-session", async (_, { dispatch, rejectWithValue }) => {
  try {
    const meResult = await dispatch(getCurrentUserHandler()).unwrap()
    return meResult
  } catch {
    try {
      await dispatch(refreshTokenHandler()).unwrap()
      const meAfterRefresh = await dispatch(getCurrentUserHandler()).unwrap()
      return meAfterRefresh
    } catch {
      return rejectWithValue({
        success: false,
        error: "Session not found.",
      })
    }
  }
})
```

Reducer behavior:

```txt
pending:
  loading = true
  initialized = false

fulfilled:
  user = payload.data.user
  isAuthenticated = true
  initialized = true
  loading = false

rejected:
  user = null
  isAuthenticated = false
  initialized = true
  loading = false
```

This one thunk is responsible for deciding the initial session state.

---

## 10. Why `initialized` Changes Only After The Full Check

Do not set this too early:

```ts
initialized = true
```

Bad startup flow:

```txt
/me fails
initialized = true
redirect to login
refresh never gets a chance
```

Good startup flow:

```txt
/me fails
try refresh
refresh succeeds
/me succeeds
initialized = true
show dashboard
```

So:

```txt
initialized = true only after the app has finished the complete session check.
```

Complete session check means:

```txt
/me succeeded
or
/me failed, refresh failed
or
/me failed, refresh succeeded, second /me finished
```

---

## 11. Where To Run Session Initialization

Your root layout currently uses:

```txt
app/providers/StoreProvider.tsx
```

That wraps the whole app in Redux.

Create a client component:

```txt
app/components/auth/auth-session-provider.tsx
```

Purpose:

```txt
Run initializeAuthSessionHandler once when the app starts.
```

Pseudo-code:

```tsx
"use client"

import { useEffect } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { initializeAuthSessionHandler } from "@/lib/features/auth.feature"

const AuthSessionProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(initializeAuthSessionHandler())
  }, [dispatch])

  return children
}

export default AuthSessionProvider
```

Then wrap your app inside it.

Conceptually:

```tsx
<StoreProvider>
  <AuthSessionProvider>
    <ToastContainer />
    {children}
  </AuthSessionProvider>
</StoreProvider>
```

Important:

`AuthSessionProvider` must be inside `StoreProvider`, because it uses Redux hooks.

---

## 12. Protect Dashboard With State

Your dashboard page currently exists here:

```txt
app/(pages)/dashboard/page.tsx
```

The simple learning version is client-side protection.

Create a guard component:

```txt
app/components/auth/protected-route.tsx
```

Pseudo-code:

```tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { initialized, isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace("/auth/login")
    }
  }, [initialized, isAuthenticated, router])

  if (!initialized) {
    return <p>Checking session...</p>
  }

  if (!isAuthenticated) {
    return null
  }

  return children
}

export default ProtectedRoute
```

Then use it around dashboard content.

Mental model:

```txt
initialized false:
  wait

initialized true and isAuthenticated false:
  redirect

initialized true and isAuthenticated true:
  show page
```

---

## 13. Now Understand Silent Refresh For Real API Requests

The startup check solves page refresh.

But what about this case?

```txt
User is already inside dashboard.
Access token expires after 15 minutes.
User clicks a button that calls a protected API.
API returns 401.
```

You do not want to log the user out immediately.

You want this:

```txt
Original request -> 401
Call refresh-token -> 200
Retry original request -> 200
```

That is what `authFetch` does.

---

## 14. Create `authFetch`

Create:

```txt
lib/api/authFetch.ts
```

Basic version:

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

Meaning:

```txt
Try real request.
If access token is valid, done.
If access token is expired, refresh.
If refresh works, retry real request.
```

This is the heart of silent refresh.

---

## 15. Why The Retried Request Works

Your tokens are in `httpOnly` cookies.

The frontend cannot read them.

But the browser automatically sends cookies on same-origin requests.

So this happens:

```txt
1. Original request sends expired accessToken cookie.
2. Backend returns 401.
3. Refresh request sends refreshToken cookie.
4. Backend validates refresh token.
5. Backend sends new Set-Cookie headers.
6. Browser stores new accessToken cookie.
7. Retried original request automatically sends new accessToken cookie.
8. Backend accepts it.
```

You do not manually attach tokens anywhere.

No `Authorization` header is needed for your current cookie-based setup.

---

## 16. Add Single-Flight Refresh

The basic `authFetch` has one production problem.

Imagine 5 requests fail at the same time:

```txt
GET /api/messages -> 401
GET /api/profile -> 401
GET /api/friends -> 401
GET /api/notifications -> 401
GET /api/settings -> 401
```

Without protection, all 5 call:

```txt
POST /api/v1/auth/refresh-token
```

That is dangerous because your refresh endpoint rotates the refresh token.

The first refresh succeeds and creates token B.

The other refresh calls may still be using token A and fail.

Solution:

```txt
Only allow one refresh request at a time.
Other failed requests wait for the same refresh request.
```

This is called single-flight refresh.

Pseudo-code:

```ts
let refreshPromise: Promise<Response> | null = null

const refreshSession = () => {
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

Then:

```ts
export const authFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
) => {
  const response = await fetch(input, init)

  if (response.status !== 401) {
    return response
  }

  const refreshResponse = await refreshSession()

  if (!refreshResponse.ok) {
    return response
  }

  return fetch(input, init)
}
```

Now 5 failed requests share 1 refresh request.

---

## 17. Retry Only Once

Never keep refreshing forever.

Bad loop:

```txt
Request -> 401
Refresh -> 200
Retry request -> 401
Refresh -> 200
Retry request -> 401
...
```

Your `authFetch` should do this:

```txt
Original request gets one retry only.
If retry still fails, return the failed response.
```

The simple implementation above already retries only once because it does not call itself recursively.

Good:

```ts
const response = await fetch(input, init)
if (response.status !== 401) return response

const refreshResponse = await refreshSession()
if (!refreshResponse.ok) return response

return fetch(input, init)
```

This makes exactly two real attempts:

```txt
1. Original request
2. One retry after refresh
```

---

## 18. How `authFetch` Updates Redux

`authFetch` itself is not a React hook.

So it should not directly use:

```ts
useAppDispatch()
```

Start simple:

```txt
authFetch returns the response.
The caller decides what to do if refresh fails.
```

Example:

```ts
const response = await authFetch("/api/v1/protected-route")

if (response.status === 401) {
  // session is gone
  // dispatch logout/session clear from component or thunk
}
```

Later production improvement:

```txt
Create a small auth event system or pass a callback to authFetch.
```

For your first version, keep it simple.

---

## 19. Where To Use `authFetch`

Use normal `fetch` for public endpoints:

```txt
/api/v1/auth/login
/api/v1/auth/register
/api/v1/auth/forgot-password
/api/v1/auth/reset-password
/api/v1/auth/refresh-token
```

Use `authFetch` for protected endpoints:

```txt
/api/v1/auth/me
/api/v1/messages
/api/v1/profile
/api/v1/friends
/api/v1/settings
```

Important:

Do not use `authFetch` inside the refresh request itself.

Otherwise:

```txt
authFetch gets 401
authFetch calls refresh
refresh uses authFetch
authFetch gets 401
...
```

Refresh must use plain `fetch`.

---

## 20. Should `/me` Use `authFetch`?

There are two valid approaches.

### Approach A: Startup Flow Controls Refresh

For `initializeAuthSessionHandler`, use plain `fetch` thunks:

```txt
getCurrentUser -> if fail -> refresh -> getCurrentUser again
```

This is easier to understand.

### Approach B: `/me` Uses `authFetch`

Then `/me` automatically refreshes and retries.

This is shorter, but it hides the learning flow.

For you, use Approach A first.

It is more educational and easier to debug.

Later, you can make `/me` use `authFetch`.

---

## 21. Reducer Update Map

Use this map when editing `auth.slice.ts`.

### Initial State

```ts
user: null
loading: false
error: ""
message: ""
isAuthenticated: false
initialized: false
```

### `initializeAuthSessionHandler.pending`

```ts
loading = true
initialized = false
error = ""
```

### `initializeAuthSessionHandler.fulfilled`

```ts
user = action.payload.data.user
isAuthenticated = true
initialized = true
loading = false
error = ""
```

### `initializeAuthSessionHandler.rejected`

```ts
user = null
isAuthenticated = false
initialized = true
loading = false
```

### `getCurrentUserHandler.fulfilled`

```ts
user = action.payload.data.user
isAuthenticated = true
initialized = true
loading = false
```

### `refreshTokenHandler.fulfilled`

```ts
loading = false
```

Do not set `user` here unless the refresh endpoint returns user data.

### `refreshTokenHandler.rejected`

```ts
user = null
isAuthenticated = false
loading = false
```

If this happens during startup, the initialize thunk should set:

```ts
initialized = true
```

### `logoutUserHandler.fulfilled`

```ts
user = null
isAuthenticated = false
initialized = true
loading = false
```

---

## 22. Example Full Startup Timeline

### Case A: User Has Valid Access Token

```txt
App opens
initialized = false

initializeAuthSession starts
GET /me -> 200

Redux:
  user = userData
  isAuthenticated = true
  initialized = true

Dashboard shows
```

### Case B: Access Token Expired, Refresh Token Valid

```txt
App opens
initialized = false

GET /me -> 401
POST /refresh-token -> 200
GET /me -> 200

Redux:
  user = userData
  isAuthenticated = true
  initialized = true

Dashboard shows
```

### Case C: No Valid Session

```txt
App opens
initialized = false

GET /me -> 401
POST /refresh-token -> 401

Redux:
  user = null
  isAuthenticated = false
  initialized = true

Protected route redirects to login
```

---

## 23. Example In-App API Timeline

This is different from startup.

The user is already inside the app.

```txt
User clicks "Load messages"
authFetch("/api/v1/messages")

GET /messages -> 401
POST /refresh-token -> 200
GET /messages again -> 200

User sees messages.
```

If refresh fails:

```txt
GET /messages -> 401
POST /refresh-token -> 401
Return original 401
Component redirects to login or dispatches logout cleanup
```

---

## 24. Implementation Order From Here

Follow this order:

```txt
1. Fix auth initialState to include isAuthenticated and initialized.
2. Add getCurrentUserHandler.
3. Add refreshTokenHandler.
4. Add logoutUserHandler.
5. Add initializeAuthSessionHandler.
6. Add reducer cases for these thunks.
7. Create AuthSessionProvider.
8. Wrap app children with AuthSessionProvider inside StoreProvider.
9. Create ProtectedRoute.
10. Wrap dashboard with ProtectedRoute.
11. Create lib/api/authFetch.ts basic version.
12. Add single-flight refresh to authFetch.
13. Use authFetch only for protected API calls.
14. Test valid access token case.
15. Test expired access token + valid refresh token case.
16. Test expired refresh token case.
17. Test logout.
```

---

## 25. Debugging Checklist

When something feels wrong, check these in order:

```txt
1. Does browser have accessToken and refreshToken cookies after login?
2. Does /me return 200 immediately after login?
3. Does Redux user get populated after /me?
4. Is initialized true after session check completes?
5. Is isAuthenticated true only when user exists?
6. Does /refresh-token return 200 when access token is expired?
7. Does /refresh-token set new cookies?
8. Does authFetch retry the original request?
9. Does logout clear cookies?
10. Does logout clear user.refreshToken in MongoDB?
```

Useful DevTools tabs:

```txt
Application -> Cookies
Network -> Fetch/XHR
Redux DevTools
```

---

## 26. The Short Mental Model

Remember this:

```txt
initialized = Do we know the auth answer yet?
isAuthenticated = Is the answer yes?
```

And:

```txt
refresh-token renews cookies
/me gives user data
authFetch retries failed protected requests
```

