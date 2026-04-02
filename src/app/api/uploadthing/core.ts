import { auth, currentUser } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const handleAuth = async () => {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    throw new Error("Unauthorized");
  }

  const user = await currentUser();
  console.log({ user });
  return { userId: user?.id };
};

export const ourFileRouter = {
  serverImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1
    }
  })
    .middleware(async () => await handleAuth())
    .onUploadComplete(() => { }),

  messageFile: f(["image", "pdf"])
    .middleware(async () => await handleAuth())
    .onUploadComplete(() => { })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
