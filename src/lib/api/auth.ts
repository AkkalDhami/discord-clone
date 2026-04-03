// export async function getMe() {
//   const res = await fetch("/api/auth/me", {
//     credentials: "include"
//   });

//   if (!res.ok) throw new Error("Not authenticated");
//   return res.json();
// }

export async function signup(data: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error("Signup failed");
  return res.json();
}

export async function login(data: { email: string; password: string }) {
  const res = await fetch("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function logout() {
  await fetch("/api/auth/signout", { method: "POST" });
}
