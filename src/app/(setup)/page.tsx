import { InitialModal } from "@/components/modals/initial-modal";
import { initialProfile } from "@/lib/initial-profile";
import Server from "@/models/server.model";
import { UserButton } from "@clerk/nextjs";
import { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  const profile = await initialProfile();

  const server = await Server.findOne(
    { "members.profileId": profile?._id },
    { members: { $elemMatch: { profileId: profile?._id } } }
  );
  if (server) {
    return redirect(`/servers/${server._id}`);
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <UserButton /> <Link href={"/sign-in" as Route}>Sign In</Link>
      <InitialModal />
    </div>
  );
}
