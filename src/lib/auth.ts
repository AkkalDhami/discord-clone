import dbConnect from "@/configs/db";
import { createProfile, setAuthCookies } from "@/helpers/auth.helper";
import Profile from "@/models/profile.model";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

import { Account, AuthOptions, Profile as NextAuthProfile } from "next-auth";
import Google from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

interface CustomProfile extends NextAuthProfile {
  picture?: string;
  avatar_url?: string;
}

export const authOptions: AuthOptions = {
  callbacks: {
    async signIn({
      account,
      profile
    }: {
      account: Account | null;
      profile?: CustomProfile | undefined;
    }) {
      if (!account || !profile) return false;
      if (account?.provider === "google" || account?.provider === "github") {
        await dbConnect();
        let user = await Profile.findOne({ email: profile?.email });

        if (!user) {
          user = await createProfile({
            name: profile?.name as string,
            email: profile?.email as string,
            avatar: profile.picture || profile.avatar_url,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            isEmailVerified: true
          });

          if (!user) return false;
        }

        await Profile.findOneAndUpdate(
          { email: profile?.email },
          {
            $set: {
              providerAccountId: account.providerAccountId,
              provider: account.provider,
              isEmailVerified: true,
              avatar: {
                url: profile.picture || profile.avatar_url
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
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],

  secret: process.env.NEXTAUTH_SECRET
};
