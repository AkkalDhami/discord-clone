import { OtpType } from "@/utils/send-email";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthData {
  user: {
    id: number | null;
    name: string | null;
    email: string | null;
  } | null;
  otp: {
    type: OtpType | null;
    email: string | null;
  };
}

export interface AuthStore extends AuthData {
  setUser: (user: AuthData["user"]) => void;
  setOtp: (otp: AuthData["otp"]) => void;
}

export const useUser = create<AuthStore>()(
  persist(
    set => ({
      user: null,
      otp: {
        type: null,
        email: null
      },
      setUser: user => set({ user }),
      setOtp: otp => set({ otp })
    }),
    {
      name: "discord-by-akkal-auth-storage"
    }
  )
);
