import {Credential} from './credential';

export class JwtCrential implements Credential {
  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  getAuthorizationHeaderValue(): string {
    return `Bearer ${this.token}`;
  }

  getToken(): string {
    return this.token;
  }
}
