import { Button } from "@/components/ui/button";

export default async function Page() {
  return (
    <div className="mx-auto flex min-h-screen flex-col items-center justify-center">
      <div className="max-w-md space-y-5 text-center">
        <p className="text-muted-secondary text-pretty">
          There are no friends online at this time. Check back later!
        </p>

        <Button variant={"primary"}>Add Friend</Button>
      </div>
    </div>
  );
}
