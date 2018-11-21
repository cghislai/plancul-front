import {Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../service/user.service';
import {LoggedUserService} from '../service/logged-user.service';
import {NotificationMessageService} from '../service/notification-message.service';
import {filter} from 'rxjs/operators';
import {WsPasswordReset} from '@charlyghislain/plancul-api';
import {LoginService} from '../service/login.service';
import {BasicCredential} from '../domain/basic-credential';
import {LocalizationService} from '../service/localization.service';
import {MessageKeys} from '../service/util/message-keys';

@Component({
  selector: 'pc-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
})
export class PasswordResetComponent implements OnInit, OnDestroy {

  token: string;
  email: string;
  password: string;
  passwordCheck: string;


  private subscription: Subscription;

  constructor(private router: Router,
              private userService: UserService,
              private localizationService: LocalizationService,
              private loginService: LoginService,
              private loggedUserService: LoggedUserService,
              private notificationMessageService: NotificationMessageService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.subscription = new Subscription();

    const routeSubscription = this.activatedRoute.queryParams.pipe(
      filter(params => params != null),
    ).subscribe(params => this.fillFormWithParams(params['email'], params['token']));
    this.subscription.add(routeSubscription);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onReset() {
    const passwordReset: WsPasswordReset = {
      email: this.email,
      password: this.password,
      resetToken: this.token,
    };
    this.userService.resetPassword(passwordReset)
      .subscribe(() => this.onResetSucceeded(),
        error => this.onResetError(error));
  }

  private fillFormWithParams(email: string, token: string) {
    if (email == null || token == null) {
      return;
    }
    this.email = email;
    this.token = token;
  }

  private onResetSucceeded() {
    forkJoin(
      this.localizationService.getTranslation(MessageKeys.PASSWORD_RESET_SUCCESS_TITLE),
      this.localizationService.getTranslation(MessageKeys.PASSWORD_RESET_SUCCESS_MESSAGE),
    ).subscribe(msgs => this.notificationMessageService.addInfo(msgs[0], msgs[1]));
    this.loginService.login(new BasicCredential(
      this.email, this.password,
    )).subscribe(() => this.router.navigate(['/welcome']));
  }

  private onResetError(error) {
    this.localizationService.getTranslation(MessageKeys.PASSWORD_RESET_ERROR_TITLE)
      .subscribe(msg => this.notificationMessageService.addError(msg, error));
  }
}
