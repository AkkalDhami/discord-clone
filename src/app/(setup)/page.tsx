import { InitialModal } from "@/components/modals/initial-modal";
import { initialProfile } from "@/lib/initial-profile";
import Member from "@/models/member.model";
import Server from "@/models/server.model";
import { redirect } from "next/navigation";

export default async function Page() {
  const profile = await initialProfile();
  const member = await Member.findOne({
    profileId: profile?._id
  });
  const server = await Server.findOne({
    _id: member?.serverId
  });

  if (server && server?.profileId?.toString() === profile?._id?.toString()) {
    return redirect(`/servers/${server._id}`);
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <InitialModal />
    </div>
  );
}
