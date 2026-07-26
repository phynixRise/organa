export interface JwtPayload {
  sub: string;
  email: string;
  tokenVersion?: number;
  iat: number;
  exp: number;
}
