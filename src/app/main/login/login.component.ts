import {Component, OnDestroy, OnInit} from '@angular/core';
import {LoginService} from '../service/login.service';
import {BasicCredential} from '../domain/basic-credential';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {LoggedUserService} from '../service/logged-user.service';
import {filter, map, publishReplay, refCount, take} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {NotificationMessageService} from '../service/notification-message.service';
import {WsApplicationGroups} from '@charlyghislain/plancul-api';

@Component({
  selector: 'pc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {

  login: string;
  password: string;

  private redirectUrl: Observable<string | null>;
  private subscription: Subscription;

  constructor(private loginService: LoginService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private notificationMessageService: NotificationMessageService,
              private loggedUserService: LoggedUserService) {
  }

  ngOnInit() {
    this.subscription = new Subscription();
    const userLoggedSubscription = this.loggedUserService.getIsInGroupsObservable(WsApplicationGroups.REGISTERED_USER)
      .pipe(
        filter(user => user),
      ).subscribe(() => this.redirectOnLoginSuccess(false, false));

    const routeParams = this.activatedRoute.params
      .pipe(publishReplay(1), refCount());
    this.redirectUrl = routeParams.pipe(
      map(params => params.redirect),
      publishReplay(1), refCount(),
    );

    this.subscription.add(userLoggedSubscription);

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
    const unregistered = this.loggedUserService.getIsInGroupsObservable(WsApplicationGroups.UNREGISTERED_USER);
    const admin = this.loggedUserService.getIsInGroupsObservable(WsApplicationGroups.ADMIN);
    combineLatest(unregistered, admin)
      .pipe(take(1))
      .subscribe(results => this.redirectOnLoginSuccess(results[0], results[1]));
  }

  private redirectOnLoginSuccess(unregistered: boolean, isAdmin: boolean) {
    if (unregistered) {
      this.notificationMessageService.addWarning('Your account needs activation');
      this.router.navigate(['/register']);
      return;
    }
    if (isAdmin) {
      this.redirectToAdminArea();
    } else {
      if (this.redirectUrl != null) {
        this.redirectUrl.pipe(take(1))
          .subscribe(redirectParam => this.triggerRedirect(redirectParam));
      } else {
        this.redirectToUserArea();
      }
    }
  }

  private triggerRedirect(url: string) {
    if (url != null) {
      this.router.navigateByUrl(url);
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
