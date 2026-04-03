import { currentAuthUser } from "@/helpers/auth.helper";
import Member from "@/models/member.model";
import Server from "@/models/server.model";
import { redirect } from "next/navigation";

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

  const profileMatch = await Member.findOne({
    where: {
      userId: user.id,
      serverId: server._id
    }
  });

  if (profileMatch) {
    return redirect(`/servers/${server._id}`);
  }

  const updatedServer = await Server.findByIdAndUpdate(
    server._id,
    {
      $push: {
        members: user.id
      }
    },
    { new: true }
  );

  if (updatedServer) {
    return redirect(`/servers/${updatedServer._id}`);
  }

  return null;
}
