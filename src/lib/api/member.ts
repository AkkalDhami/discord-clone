import MemberRole from "@/enums/role.enum";

export async function updateMemberRole({
  serverId,
  memberId,
  role
}: {
  serverId: string;
  memberId: string;
  role: MemberRole;
}) {
  const res = await fetch(`/api/members/${memberId}?serverId=${serverId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
    credentials: "include"
  });

  return res.json();
}

export async function deleteMember(serverId: string, memberId: string) {
  const res = await fetch(`/api/members/${memberId}?serverId=${serverId}`, {
    method: "DELETE",
    credentials: "include"
  });

  return res.json();
}
