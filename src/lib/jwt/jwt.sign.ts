import jwt from "jsonwebtoken";
import { AccessTokenPayload, JwtType, RefreshTokenPayload } from "./jwt.types";

export function signAccessToken(payload: {
  sub: string;
  email: string;
}): string {
  const tokenPayload: AccessTokenPayload = {
    sub: payload.sub,
    type: JwtType.ACCESS,
    email: payload.email
  };

  return jwt.sign(tokenPayload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: "2d"
  });
}

export function signRefreshToken(payload: { sub: string }): string {
  const tokenPayload: RefreshTokenPayload = {
    sub: payload.sub,
    type: JwtType.REFRESH
  };

  return jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d"
  });
}
