import {
  ForgotPasswordFormData,
  ResetPasswordFormData,
  SigninFormData,
  SignupFormData,
  VerifyResetOtpFormData
} from "@/validators/auth";

const serverBaseUrl =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000"
    : "";

function apiUrl(path: string) {
  return serverBaseUrl ? `${serverBaseUrl.replace(/\/$/, "")}${path}` : path;
}

export async function getMe() {
  const res = await fetch(apiUrl("/api/auth/me"), {
    credentials: "include",
    cache: "no-store"
  });

  if (!res.ok) return null;

  return res.json();
}

export async function signup(data: SignupFormData) {
  const res = await fetch(apiUrl("/api/auth/signup"), {
    method: "POST",
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function login(data: SigninFormData) {
  const res = await fetch(apiUrl("/api/auth/signin"), {
    method: "POST",
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function logout() {
  await fetch(apiUrl("/api/auth/signout"), {
    method: "POST",
    credentials: "include"
  });
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export async function refreshTokens(): Promise<boolean> {
  try {
    const res = await fetch(apiUrl("/api/auth/refresh"), {
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

export async function forgotPassword(data: ForgotPasswordFormData) {
  const res = await fetch(apiUrl("/api/auth/forgot-password"), {
    method: "POST",
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function verifyResetOtp(data: VerifyResetOtpFormData) {
  const res = await fetch(apiUrl("/api/auth/verify-reset-otp"), {
    method: "POST",
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function resetPassword(data: ResetPasswordFormData) {
  const res = await fetch(apiUrl("/api/auth/reset-password"), {
    method: "POST",
    body: JSON.stringify(data)
  });

  return res.json();
}
