export enum JwtType {
  ACCESS = "access",
  REFRESH = "refresh"
}

export type JwtPayloadBase = {
  sub: string;
  iat?: number;
  exp?: number;
};

export type AccessTokenPayload = JwtPayloadBase & {
  type: JwtType.ACCESS;
  email: string;
};

export type RefreshTokenPayload = JwtPayloadBase & {
  type: JwtType.REFRESH;
};

export type JwtPayload = AccessTokenPayload | RefreshTokenPayload;
