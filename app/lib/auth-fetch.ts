"use client";

let refreshRequest: Promise<boolean> | null = null;

const isAuthEndpoint = (input: RequestInfo | URL, endpoint: string) => {
  const url = input instanceof Request ? input.url : String(input);
  return url.includes(endpoint);
};

const logoutAndRedirect = async () => {
  try {
    await fetch("/api/v1/auth/logout", { method: "POST" });
  } catch {
    // Redirecting to login is still the right fallback if logout cannot finish.
  }

  if (typeof window !== "undefined" && window.location.pathname !== "/auth/login") {
    window.location.assign("/auth/login");
  }
};

const refreshSession = async () => {
  const response = await fetch("/api/v1/auth/refresh-token", {
    method: "POST",
    cache: "no-store",
  });

  return response.ok;
};

export const authFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const requestInput = input instanceof Request ? input.clone() : input;
  const response = await fetch(requestInput, init);

  if (
    response.status !== 401 ||
    isAuthEndpoint(input, "/api/v1/auth/refresh-token") ||
    isAuthEndpoint(input, "/api/v1/auth/logout")
  ) {
    return response;
  }

  if (!refreshRequest) {
    refreshRequest = refreshSession().finally(() => {
      refreshRequest = null;
    });
  }

  const refreshed = await refreshRequest;

  if (!refreshed) {
    await logoutAndRedirect();
    return response;
  }

  const retryInput = input instanceof Request ? input.clone() : input;
  const retryResponse = await fetch(retryInput, init);

  if (retryResponse.status === 401) {
    await logoutAndRedirect();
  }

  return retryResponse;
};
