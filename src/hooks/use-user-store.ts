import { IFile } from "@/interface";
import { OtpType } from "@/utils/send-email";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthData {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: IFile;
  } | null;
  otp: {
    type: OtpType;
    email: string;
  } | null;
}

export interface AuthStore extends AuthData {
  setUser: (user: AuthData["user"]) => void;
  setOtp: (otp: AuthData["otp"]) => void;
}

export const useUser = create<AuthStore>()(
  persist(
    set => ({
      user: null,
      otp: null,
      setUser: user => set({ user }),
      setOtp: otp => set({ otp })
    }),
    {
      name: "discord-by-akkal-user-storage"
    }
  )
);
