import { useAuth, UserButton } from "@clerk/nextjs";

export default function Page() {
  const { isSignedIn, userId } = useAuth();
  console.log({
    isSignedIn,
    userId
  });
  return (
    <div className="flex h-screen items-center justify-center">
      <UserButton />
    </div>
  );
}
