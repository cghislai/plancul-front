import {Component, OnInit} from '@angular/core';
import {UserService} from '../service/user.service';
import {NotificationMessageService} from '../service/notification-message.service';
import {Router} from '@angular/router';

@Component({
  selector: 'pc-new-password-reset',
  templateUrl: './new-password-reset.component.html',
  styleUrls: ['./new-password-reset.component.scss'],
})
export class NewPasswordResetComponent implements OnInit {

  email: string;

  constructor(private userService: UserService,
              private notificationMessageService: NotificationMessageService,
              private router: Router) {
  }

  ngOnInit() {
  }

  onReset() {
    this.userService.createNewPasswordResetToken(this.email)
      .subscribe(() => this.onSuccess(),
        error => this.onError(error));
  }

  private onSuccess() {
    this.notificationMessageService.addInfo('An email has been sent', 'Check your inbox for a link to reset your password');
    this.router.navigate(['/login']);
  }

  private onError(error: any) {
    this.notificationMessageService.addError('Could not send you the reset link by mail', error);
  }
}
