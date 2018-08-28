import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LoggedUserService} from '../service/logged-user.service';
import {Subscription} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import {AuthenticatorGroups} from '../service/util/authenticator-groups';
import {UserService} from '../service/user.service';
import {NotificationMessageService} from '../service/notification-message.service';
import {WsUserEmailVerification} from '@charlyghislain/plancul-api';

@Component({
  selector: 'pc-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss'],
})
export class ActivateAccountComponent implements OnInit, OnDestroy {

  token: string;
  email: string;

  private subscription: Subscription;

  constructor(private router: Router,
              private userService: UserService,
              private loggedUserService: LoggedUserService,
              private notificationMessageService: NotificationMessageService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.subscription = new Subscription();

    const routeSubscription = this.activatedRoute.queryParams.pipe(
      filter(params => params != null),
    ).subscribe(params => this.handleRouteParams(params['email'], params['token']));
    this.subscription.add(routeSubscription);

    const activatedSubscription = this.loggedUserService.getIsInGroupsObservable(AuthenticatorGroups.ACTIVE)
      .pipe(filter(inGroup => inGroup), take(1))
      .subscribe(active => this.onVerificationSuceeded());
    this.subscription.add(activatedSubscription);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onActivate() {
    const verification: WsUserEmailVerification = {
      verificationToken: this.token,
      email: this.email,
    };
    this.userService.validateUserEmail(verification)
      .subscribe(() => this.onVerificationSuceeded(),
        error => this.onVerificationError(error));
  }

  private handleRouteParams(email: string, token: string) {
    if (email == null || token == null) {
      return;
    }
    this.email = email;
    this.token = token;
    const verification: WsUserEmailVerification = {
      verificationToken: token,
      email: email,
    };
    this.userService.validateUserEmail(verification)
      .subscribe(() => this.onVerificationSuceeded(),
        error => this.onVerificationError(error));
  }

  private onVerificationSuceeded() {
    this.notificationMessageService.addInfo('Email verified', 'You may now login');
    this.router.navigate(['/login']);
  }

  private onVerificationError(error) {
    this.notificationMessageService.addError(error);
  }
}
