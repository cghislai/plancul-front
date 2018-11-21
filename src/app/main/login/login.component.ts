import {Component, OnDestroy, OnInit} from '@angular/core';
import {LoginService} from '../service/login.service';
import {BasicCredential} from '../domain/basic-credential';
import {combineLatest, forkJoin, Observable, Subscription} from 'rxjs';
import {LoggedUserService} from '../service/logged-user.service';
import {filter, map, publishReplay, refCount, take} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {NotificationMessageService} from '../service/notification-message.service';
import {WsApplicationGroups} from '@charlyghislain/plancul-api';
import {LocalizationService} from '../service/localization.service';
import {ErrorKeys} from '../service/util/error-keys';
import {MessageKeys} from '../service/util/message-keys';

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
              private localizationService: LocalizationService,
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
      this.localizationService.getTranslation(ErrorKeys.ACOOUNT_NEEDS_ACTIVATION)
        .subscribe(msg => this.notificationMessageService.addWarning(msg));
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
      forkJoin(
        this.localizationService.getTranslation(MessageKeys.LOGIN_FAILED_TITLE),
        this.localizationService.getTranslation(ErrorKeys.INVALID_CREDENTIALS),
      ).subscribe(msgs => this.notificationMessageService.addError(msgs[0], msgs[1]));
    } else {
      forkJoin(
        this.localizationService.getTranslation(MessageKeys.LOGIN_FAILED_TITLE),
        this.localizationService.getTranslation(ErrorKeys.UNEXPECTED_ERROR),
      ).subscribe(msgs => this.notificationMessageService.addError(msgs[0], msgs[1]));
    }
  }

}
