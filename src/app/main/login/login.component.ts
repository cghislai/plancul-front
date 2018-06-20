import {Component, OnDestroy, OnInit} from '@angular/core';
import {LoginService} from '../service/login.service';
import {BasicCredential} from '../domain/basic-credential';
import {Subscription} from 'rxjs';
import {LoggedUserService} from '../service/logged-user.service';
import {filter, take} from 'rxjs/operators';
import {Router} from '@angular/router';
import {NotificationMessageService} from '../service/notification-message.service';

@Component({
  selector: 'pc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {

  login: string;
  password: string;

  private subscription: Subscription;

  constructor(private loginService: LoginService,
              private router: Router,
              private notificationMessageService: NotificationMessageService,
              private loggedUserService: LoggedUserService) {
  }

  ngOnInit() {
    this.subscription = new Subscription();
    const userLoggedSubscription = this.loggedUserService.getIsUserObservable()
      .pipe(
        filter(user => user),
      ).subscribe(() => this.redirectToUserArea());
    const adminLoggedSubscription = this.loggedUserService.getIsAdminObservable()
      .pipe(
        filter(user => user),
      ).subscribe(() => this.redirectToAdminArea());
    this.subscription.add(userLoggedSubscription);
    this.subscription.add(adminLoggedSubscription);

    this.login = this.loggedUserService.getLastUserLogin();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onLogin() {
    const credential = new BasicCredential(this.login, this.password);
    this.loginService.login(credential)
      .subscribe(() => this.onLoginSuccess(),
        error => this.onLoginError(error));
  }

  private onLoginSuccess() {
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

  private onLoginError(error: any) {
    if (this.loginService.isInvalidCredentialError(error)) {
      // TODO: translate in backend and use error message
      this.notificationMessageService.addError('Login failed', 'Invalid credential');
    } else {
      this.notificationMessageService.addError('Login failed', 'Unexpected error');
    }
  }

}
