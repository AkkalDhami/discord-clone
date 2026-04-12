// import { auth } from "@/lib/auth";

export default async function Page() {
  // const session = await auth();
  return (
    <div className="flex h-screen items-center justify-center">
      {/* {JSON.stringify(session)} */}
      <h1 className="text-3xl font-bold">Profile Page</h1>
    </div>
  );
}
