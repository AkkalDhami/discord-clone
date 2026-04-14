import dbConnect from "@/configs/db";
import { createProfile, setAuthCookies } from "@/helpers/auth.helper";
import Profile from "@/models/profile.model";
import { AuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export const authOptions: AuthOptions = {
  callbacks: {
    async signIn({ account, profile }) {
      if (!account || !profile) return false;
      if (account?.provider === "google") {
        await dbConnect();
        let user = await Profile.findOne({ email: profile?.email });

        if (!user) {
          user = await createProfile({
            name: profile?.name as string,
            email: profile?.email as string,
            avatar: (profile?.picture as string) || (profile.image as string),
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            isEmailVerified: profile.email_verified
          });

          if (!user) return false;
        }

        await Profile.findOneAndUpdate(
          { email: profile?.email },
          {
            $set: {
              providerAccountId: account.providerAccountId,
              provider: account.provider,
              isEmailVerified: profile.email_verified,
              avatar: {
                url: profile?.picture || profile.image
              }
            }
          }
        );

        const accessToken = signAccessToken({
          sub: user._id.toString(),
          email: user.email
        });

        const refreshToken = signRefreshToken({
          sub: user._id.toString()
        });

        await setAuthCookies(accessToken, refreshToken);
      }
      return true;
    }
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],

  secret: process.env.NEXTAUTH_SECRET
};
