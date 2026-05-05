const inviteRegex =
  /https?:\/\/(localhost:3000|discordbyakkal\.vercel.app)\/invite\/([a-f0-9-]+)/i;

export function extractInviteId(content: string) {
  const match = content.match(inviteRegex);

  return match?.[match.length - 1] ?? null;
}
