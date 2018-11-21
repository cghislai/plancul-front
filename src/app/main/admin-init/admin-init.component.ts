import {Component, Inject, LOCALE_ID, OnDestroy, OnInit} from '@angular/core';
import {WsApplicationGroups, WsUser, WsUserRegistration} from '@charlyghislain/plancul-api';
import {LoginService} from '../service/login.service';
import {LanguageUtil} from '../service/util/language-util';
import {forkJoin, Observable, of, Subscription} from 'rxjs';
import {BasicCredential} from '../domain/basic-credential';
import {filter, mergeMap, take} from 'rxjs/operators';
import {NotificationMessageService} from '../service/notification-message.service';
import {Router} from '@angular/router';
import {ApplicationStatusClientService} from '../service/application-status-client.service';
import {LoggedUserService} from '../service/logged-user.service';
import {UserService} from '../service/user.service';
import {MessageKeys} from '../service/util/message-keys';
import {LocalizationService} from '../service/localization.service';
import {ErrorKeys} from '../service/util/error-keys';

@Component({
  selector: 'pc-admin-init',
  templateUrl: './admin-init.component.html',
  styleUrls: ['./admin-init.component.scss'],
})
export class AdminInitComponent implements OnInit, OnDestroy {

  registration: WsUserRegistration;
  useExistingAccount: boolean;

  existingAccountLogin: string;
  existingAccountPassword: string;

  newAccountPasswordCheck: string;

  private subscription: Subscription;


  constructor(@Inject(LOCALE_ID) private localeId: string,
              private loggedUserService: LoggedUserService,
              private localizationService: LocalizationService,
              private applicationStatusClientService: ApplicationStatusClientService,
              private loginService: LoginService,
              private userService: UserService,
              private router: Router,
              private notificationMessageService: NotificationMessageService,
  ) {
    this.subscription = new Subscription();
    const adminLoggedSubscription = this.loggedUserService.getIsInGroupsObservable(WsApplicationGroups.ADMIN)
      .pipe(
        filter(isGroup => isGroup),
      ).subscribe(() => this.onAdminLoggedIn());
    this.subscription.add(adminLoggedSubscription);

    this.registration = {
      email: null,
      name: null,
      password: null,
      user: {
        firstName: null,
        lastName: null,
        language: LanguageUtil.getLanguageFromLocaleId(this.localeId),
      },
    };
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onRegister() {
    let loginTask: Observable<any>;

    if (this.useExistingAccount) {
      this.registration.name = null;
      this.registration.email = null;
      loginTask = this.loginService.login(new BasicCredential(
        this.existingAccountLogin, this.existingAccountPassword,
      ));
    } else {
      loginTask = of(null);
    }

    loginTask.pipe(
      mergeMap(() => this.register(this.useExistingAccount)),
    ).subscribe(user => this.onRegistered(user),
      error => this.onRegistrationError(error));
  }

  private onRegistered(user: WsUser) {
    this.localizationService.getTranslation(MessageKeys.ADMIN_ACCOUNT_CREATED_TITLE)
      .subscribe(msg => this.notificationMessageService.addInfo(msg));
    this.loginPostRegistration(user).subscribe(
      () => {
      },
      error => this.router.navigate(['/activate-account']),
    );
  }

  private onRegistrationError(error: any) {
    this.localizationService.getTranslation(ErrorKeys.FAILED_TO_CREATE_ADMIN_ACCOUNT)
      .subscribe(msg => this.notificationMessageService.addError(msg, error));
  }

  private onAdminLoggedIn() {
    this.router.navigate(['/admin']);
  }

  private register(useExistingAccount: boolean) {
    if (useExistingAccount) {
      return this.userService.registerUser(this.registration);
    } else {
      return this.userService.createNewUser(this.registration);
    }
  }

  private loginPostRegistration(newUser: WsUser) {
    return this.loggedUserService.getUserObservable().pipe(
      take(1),
      mergeMap(loggedUser => this.loginWithNewUserIfRequired(loggedUser, newUser)),
    );
  }

  private loginWithNewUserIfRequired(loggedUser: WsUser, newUser: WsUser) {
    if (loggedUser != null && loggedUser.id === newUser.id) {
      return this.loggedUserService.refreshToken();
    }
    return this.loginService.login(new BasicCredential(
      this.registration.name, this.registration.password,
    ));
  }
}
