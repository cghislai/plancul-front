export interface JosePayload {
  iss: string;
  aud: string;
  exp: number;
  jti: string;
  iat: number;
  nbf: number;
  sub: string;
  grps: string[];
}
