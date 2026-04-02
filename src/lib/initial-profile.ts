import dbConnect from "@/configs/db";
import Profile from "@/models/profile.model";
import { currentUser } from "@clerk/nextjs/server";
export const initialProfile = async () => {
  await dbConnect();
  const user = await currentUser();
  if (!user) {
    return null;
  }

  console.log({ user })

  const email = user.emailAddresses[0].emailAddress;

  if (!email) {
    throw new Error("Email is required");
  }

  const profile = await Profile.findOne({
    email: email
  });

  if (profile) {
    return profile;
  }

  const newProfile = await Profile.create({
    userId: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.emailAddresses[0].emailAddress,
    avatarUrl: user.imageUrl
  });
  return newProfile;

};