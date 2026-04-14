import { SignupFormData } from "@/validators/auth";

// export async function getMe() {
//   const res = await fetch("/api/auth/me", {
//     credentials: "include"
//   });

export async function signup(data: SignupFormData) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function login(data: { email: string; password: string }) {
  const res = await fetch("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function logout() {
  await fetch("/api/auth/signout", {
    method: "POST",
    credentials: "include"
  });
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export async function refreshTokens(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include"
    });

    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function fetchWithAuth(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const makeRequest = () =>
    fetch(input, {
      ...init,
      credentials: "include"
    });

  const response = await makeRequest();

  if (response.status !== 401) {
    return response;
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = refreshTokens().finally(() => {
      isRefreshing = false;
    });
  }

  const success = await refreshPromise;

  if (!success) {
    throw new Error("Session expired");
  }

  return makeRequest();
}
