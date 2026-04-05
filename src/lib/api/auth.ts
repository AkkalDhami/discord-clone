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
