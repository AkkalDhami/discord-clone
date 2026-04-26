import { InviteCard } from "@/components/common/invite-card";
import ThemeToggle from "@/components/layouts/theme-toggle";
import { currentAuthUser } from "@/helpers/auth.helper";
import Member from "@/models/member.model";
import Server from "@/models/server.model";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page(props: PageProps<"/invite/[inviteCode]">) {
  const params = await props.params;
  const { inviteCode } = params;

  const user = await currentAuthUser();

  if (!user) {
    return redirect("/signin");
  }

  if (!inviteCode) {
    return redirect("/");
  }

  const server = await Server.findOne({ inviteCode });
  if (!server) {
    return redirect("/");
  }

  const members = await Member.find({ serverId: server._id });

  const profileMatch = await Member.findOne({
    profileId: user.id,
    serverId: server._id
  });

  if (profileMatch) {
    return redirect(`/servers/${server._id}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <InviteCard
        serverId={server._id.toString()}
        inviterName={user.name}
        serverName={server.name}
        memberCount={members?.length || 0}
        serverLogo={server?.logo}
      />
      <ThemeToggle />
    </div>
  );
}
