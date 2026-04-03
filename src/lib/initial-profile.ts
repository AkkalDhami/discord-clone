import dbConnect from "@/configs/db";
import { currentAuthUser } from "@/helpers/auth.helper";
import Profile from "@/models/profile.model";
export const initialProfile = async () => {
  await dbConnect();
  const user = await currentAuthUser();
  if (!user) {
    return null;
  }

  const email = user.email;

  if (!email) {
    throw new Error("Email is required");
  }

  const profile = await Profile.findOne({
    email: email
  });

  return {
    _id: profile?._id.toString(),
    name: profile?.name,
    email: profile?.email,
    avatar: profile?.avatar,
    servers: profile?.servers,
    channels: profile?.channels,
    createdAt: profile?.createdAt,
    updatedAt: profile?.updatedAt,
  };
};
