import { currentAuthUser } from "@/helpers/auth.helper";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const currentUser = await currentAuthUser();

  if (!currentUser) {
    return redirect("/signin");
  }

  return redirect("/friends/all");
}
