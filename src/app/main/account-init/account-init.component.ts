import {Component, OnDestroy, OnInit} from '@angular/core';
import {WsUserAccountInitRequest} from '@charlyghislain/plancul-ws-api';
import {LoginService} from '../service/login.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {LoggedUserService} from '../service/logged-user.service';
import {take} from 'rxjs/operators';
import {NotificationMessageService} from '../service/notification-message.service';
import {RequestService} from '../service/request.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'pc-account-init',
  templateUrl: './account-init.component.html',
  styleUrls: ['./account-init.component.scss'],
})
export class AccountInitComponent implements OnInit, OnDestroy {

  password: string;
  passwordConfirm: string;

  passwordsMatch: boolean;

  private email: string;
  private token: string;

  private subscription: Subscription;

  constructor(private loginService: LoginService,
              private loggedUserService: LoggedUserService,
              private requestService: RequestService,
              private notificationMessageService: NotificationMessageService,
              private router: Router,
              private activateRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.subscription = this.activateRoute.queryParams
      .subscribe(params => this.handleRouteParams(params));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  checkPasswordsMatch() {
    this.passwordsMatch = this.password === this.passwordConfirm;
  }

  onSubmit() {
    this.checkPasswordsMatch();
    if (!this.passwordsMatch) {
      return;
    }

    const requestData: WsUserAccountInitRequest = {
      email: this.email,
      passwordToken: this.token,
      password: this.password,
    };
    this.loginService.activateAccount(requestData)
      .subscribe(() => this.onInitSuccess(),
        (error) => this.onInitError(error));
  }

  private onInitSuccess() {
    this.notificationMessageService.addInfo('Password saved');
    this.loggedUserService.getIsAdminObservable()
      .pipe(take(1))
      .subscribe(admin => this.redirectOnLoginSuccess(admin));
  }


  private redirectOnLoginSuccess(isAdmin: boolean) {
    if (isAdmin) {
      this.redirectToAdminArea();
    } else {
      this.redirectToUserArea();
    }
  }


  private redirectToUserArea() {
    this.router.navigate(['/welcome']);
  }

  private redirectToAdminArea() {
    this.router.navigate(['/admin']);
  }

  private onInitError(error: any) {
    if (this.requestService.isBadRequestError(error)) {
      // TODO: translate in backend and use error message
      this.notificationMessageService.addError('Error', 'The provided information is invalid');
    } else if (this.requestService.isHttpErrorWithStatusCodeStartingWith(error, 420)) {
      this.notificationMessageService.addError('Url expired', 'This url has expired. A new mail will be sent');
      // TODO
    } else {
      this.notificationMessageService.addError('Error', 'Unexpected error');
    }
  }

  private handleRouteParams(params: Params) {
    const caller = params['caller'];
    const token = params['token'];
    if (caller == null || token == null) {
      this.router.navigate(['/login']);
      return;
    }

    this.email = caller;
    this.token = token;
  }
}
