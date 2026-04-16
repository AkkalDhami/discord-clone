import { OtpType } from "@/utils/send-email";

type SendOtpBase = {
  name: string;
  email: string;
  subject: string;
  type: OtpType;
};

type SendOtpWithCode = SendOtpBase & {
  code: string;
  hashCode: string;
};

type SendOtpWithoutCode = SendOtpBase & {
  code?: never;
  hashCode?: never;
};

export type SendOtpType = SendOtpWithCode | SendOtpWithoutCode;
