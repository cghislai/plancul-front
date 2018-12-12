import {Injectable} from '@angular/core';
import {RequestService} from './request.service';
import {Observable} from 'rxjs';
import {CredentialProviderService} from './credential-provider.service';
import {WsPasswordReset, WsSearchResult, WsUser, WsUserEmailVerification, WsUserRegistration} from '@charlyghislain/plancul-api';
import {Pagination} from '../domain/pagination';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(private requestService: RequestService,
              private credentialProvider: CredentialProviderService) {
  }

  createNewUser(registration: WsUserRegistration): Observable<WsUser> {
    const url = this.requestService.buildPlanCulApiUrl('/user/new');
    return this.requestService.post(url, registration);
  }

  registerUser(registration: WsUserRegistration): Observable<WsUser> {
    const url = this.requestService.buildPlanCulApiUrl('/user/register');
    return this.requestService.post(url, registration);
  }

  validateUserEmail(verification: WsUserEmailVerification) {
    const url = this.requestService.buildPlanCulApiUrl(`/user/email/verification`);
    return this.requestService.post(url, verification);
  }

  createNewPasswordResetToken(email: string) {
    const url = this.requestService.buildPlanCulApiUrl(`/user/password/resetToken`);
    return this.requestService.post(url, email);
  }

  resetPassword(passwordReset: WsPasswordReset) {
    const url = this.requestService.buildPlanCulApiUrl(`/user/password/reset`);
    return this.requestService.post(url, passwordReset);
  }


  searchUsers(pagination: Pagination): Observable<WsSearchResult<WsUser>> {
    const url = this.requestService.buildPlanCulApiUrl(`/user/search`);
    return this.requestService.post(url, {}, pagination);
  }

  fetchUser(id: number): Observable<WsUser> {
    const url = this.requestService.buildPlanCulApiUrl(`/user/${id}`);
    return this.requestService.get(url);
  }

  removeUser(id: number): Observable<any> {
    const url = this.requestService.buildPlanCulApiUrl(`/user/${id}`);
    return this.requestService.delete(url);
  }
}
