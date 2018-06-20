import {Credential} from './credential';

export class BasicCredential implements Credential {

  private readonly userName: string;
  private readonly password: string;

  constructor(userName: string, password: string) {
    this.userName = userName;
    this.password = password;
  }

  getAuthorizationHeaderValue() {
    const joined = `${this.userName}:${this.password}`;
    const encoded = btoa(joined);
    const header = `Basic ${encoded}`;
    return header;
  }

  getUserName(): string {
    return this.userName;
  }
}
