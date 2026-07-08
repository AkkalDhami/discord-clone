import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import Profile from "@/models/profile.model";
import { utapi } from "@/server/uploadting";
import { UpdateUserProfile } from "@/types/auth";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { NextRequest } from "next/server";

export const GET = AsyncHandler(async () => {
  const user = await currentAuthUser();

  if (!user) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized",
      success: false
    });
  }

  return ApiResponse({
    success: true,
    statusCode: STATUS_CODES.OK,
    message: `User profile fetched successfully`,
    data: { user }
  });
});

export const PATCH = AsyncHandler(async (req: NextRequest) => {
  const user = await currentAuthUser();

  if (!user) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized",
      success: false
    });
  }

  const formData: UpdateUserProfile = await req.json();

  const { username, avatar, name } = formData;

  const usernameExists = await Profile.findOne({
    username,
    _id: { $ne: user.id }
  });

  if (usernameExists) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.CONFLICT,
      message: "Username already exists"
    });
  }

  if (username) {
    await Profile.findOneAndUpdate(
      { _id: user.id },
      {
        $set: {
          username
        }
      }
    );
  }

  if (avatar) {
    if (user && user?.avatar?.public_id) {
      await utapi.deleteFiles(user.avatar.public_id);
    }

    await Profile.findOneAndUpdate(
      { _id: user.id },
      {
        $set: {
          avatar
        }
      }
    );
  }

  if (name) {
    await Profile.findOneAndUpdate(
      { _id: user.id },
      {
        $set: {
          name
        }
      }
    );
  }

  return ApiResponse({
    success: true,
    statusCode: STATUS_CODES.OK,
    message: `User profile updated successfully`,
    data: {
      user: {
        id: user.id,
        name: name || user.name,
        username: username || user.username,
        email: user.email,
        avatar: avatar || user.avatar
      }
    }
  });
});
