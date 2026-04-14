import { currentAuthUser } from "@/helpers/auth.helper";
import Channel from "@/models/channel.model";
import Member from "@/models/member.model";
import { Route } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Page(props: PageProps<"/servers/[serverId]">) {
  const profile = await currentAuthUser();
  const { serverId } = await props.params;

  if (!profile) {
    return redirect("/signin");
  }

  const member = await Member.findOne({
    profileId: profile.id,
    serverId
  });

  if (!member) {
    return redirect("/");
  }

  const channel = await Channel.findOne({
    serverId: member.serverId
  });

  if (channel) {
    redirect(`/servers/${serverId}/channels/${channel._id}` as Route);
  }

  return (
    <div className="mx-auto flex min-h-screen flex-col items-center justify-center">
      <div className="max-w-md space-y-5 text-center">
        <Image
          width={100}
          height={100}
          src="/no-channel.svg"
          alt="No Channel"
          className="mx-auto size-60"
        />
        <h2 className="text-muted-foreground text-xl font-semibold uppercase">
          No Channels Found
        </h2>
        <p className="text-muted-secondary text-pretty">
          You find yourself in a strange place. You don&apos;t have access to
          any text channels or there are none in this server.
        </p>
      </div>
    </div>
  );
}
