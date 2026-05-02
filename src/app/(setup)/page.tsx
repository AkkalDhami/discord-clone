// import { InitialModal } from "@/components/modals/initial-modal";
import { currentAuthUser } from "@/helpers/auth.helper";
import Member from "@/models/member.model";
import Server from "@/models/server.model";
// import Member from "@/models/member.model";
// import Server from "@/models/server.model";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const profile = await currentAuthUser();
  if (!profile) {
    return redirect("/signin");
  }
  const member = await Member.findOne({
    profileId: profile.id
  });

  const server = await Server.findOne({
    _id: member?.serverId
  });

  if (server && profile) {
    return redirect(`/servers/${server._id}`);
  }

  return redirect("/servers");

  // return (
  //   <div className="flex h-screen items-center justify-center">
  //     <InitialModal />
  //   </div>
  // );
}
