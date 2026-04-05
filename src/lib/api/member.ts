import MemberRole from "@/enums/role.enum";

export async function updateMemberRole(url: string, role: MemberRole) {
  const res = await fetch(url, {
    method: "PATCH",
    body: JSON.stringify({ role }),
    credentials: "include"
  });

  return res.json();
}

export async function deleteMember(url: string) {
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include"
  });

  return res.json();
}
