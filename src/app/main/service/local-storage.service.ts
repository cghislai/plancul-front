import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {

  private readonly TOKEN_KEY = 'plancul-jwt';

  constructor() {
  }

  putAuthToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getAuthToken(): string {
    return localStorage.getItem(this.TOKEN_KEY);
  }

}
