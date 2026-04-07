import { currentAuthUser } from "@/helpers/auth.helper";
import { redirect } from "next/navigation";

export default async function Page(
  props: PageProps<"/servers/[serverId]/channels/[channelId]">
) {
  const profile = await currentAuthUser();

  if (!profile) {
    return redirect("/signin");
  }

  return <div className="pt-6 px-6">channel id page</div>;
}
