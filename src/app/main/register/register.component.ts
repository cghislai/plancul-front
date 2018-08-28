import {Component, Inject, LOCALE_ID, OnDestroy, OnInit} from '@angular/core';
import {WsApplicationGroups, WsUser, WsUserRegistration} from '@charlyghislain/plancul-api';
import {LanguageUtil} from '../service/util/language-util';
import {LoginService} from '../service/login.service';
import {Observable, Subscription} from 'rxjs';
import {LoggedUserService} from '../service/logged-user.service';
import {mergeMap, take} from 'rxjs/operators';
import {BasicCredential} from '../domain/basic-credential';
import {Router} from '@angular/router';
import {NotificationMessageService} from '../service/notification-message.service';
import {AuthenticatorGroups} from '../service/util/authenticator-groups';
import {UserService} from '../service/user.service';
import {WsUser as WsAuthenticatorUser} from '@charlyghislain/authenticator-api';

@Component({
  selector: 'pc-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {

  registration: WsUserRegistration;
  newAccountPasswordCheck: string;

  hasExistingAccount: Observable<boolean>;

  private redirectUrl: Observable<string | null>;
  private subscription: Subscription;

  constructor(@Inject(LOCALE_ID) private localeId: string,
              private userService: UserService,
              private loginService: LoginService,
              private loggedUserService: LoggedUserService,
              private router: Router,
              private notificationMessageService: NotificationMessageService,
  ) {
    this.subscription = new Subscription();
    this.hasExistingAccount = this.loggedUserService.getIsInGroupsObservable(WsApplicationGroups.UNREGISTERED_USER);

    // const registered = this.loggedUserService.getIsInGroupsObservable(WsApplicationGroups.REGISTERED_USER);
    // const active = this.loggedUserService.getIsInGroupsObservable(AuthenticatorGroups.ACTIVE);
    // const userRegisteredSubscription = combineLatest(registered, active)
    //   .subscribe(results => this.onRegisteredUserLoggedIn(results[0], results[1]));
    // this.subscription.add(userRegisteredSubscription);


    this.registration = {
      email: null,
      name: null,
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
    this.hasExistingAccount.pipe(
      take(1),
      mergeMap(hasAccount => this.register(hasAccount)),
    )
      .subscribe(createdUser => this.onRegistered(createdUser),
        error => this.onRegistrationError(error));
  }

  logout() {
    this.loggedUserService.logout();
  }

  private register(hasAccount: boolean) {
    let registerTask: Observable<any>;

    if (hasAccount) {
      this.registration.name = null;
      this.registration.password = null;
      registerTask = this.userService.registerUser(this.registration);
    } else {
      registerTask = this.userService.createNewUser(this.registration);
    }
    return registerTask;
  }

  private onRegistered(user: WsUser) {
    this.notificationMessageService.addInfo('Account created');
    this.loginPostRegistration(user)
      .pipe(
        mergeMap(() => this.loggedUserService.getIsInGroupsObservable(AuthenticatorGroups.ACTIVE)),
      )
      .subscribe(active => this.onRegisteredUserLoggedIn(active),
        error => this.router.navigate(['/activate-account']),
      );
  }

  private onRegisteredUserLoggedIn(active: boolean) {
    if (active) {
      this.router.navigate(['/welcome']);
    } else {
      this.router.navigate(['/activate-account']);
    }
  }

  private onRegistrationError(error: any) {
    this.notificationMessageService.addError('Failed to create your account', error);
  }

  private loginPostRegistration(newUser: WsUser) {
    return this.loggedUserService.getAuthenticatorUserObservable().pipe(
      take(1),
      mergeMap(loggedUser => this.loginWithNewUserIfRequired(loggedUser, newUser)),
    );
  }

  private loginWithNewUserIfRequired(loggedUser: WsAuthenticatorUser, newUser: WsUser) {
    if (loggedUser == null) {
      return this.loginService.login(new BasicCredential(
        this.registration.name, this.registration.password,
      ));
    } else {
      return this.loginService.relogin();
    }
  }
}
