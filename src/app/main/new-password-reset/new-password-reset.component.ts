import {Component, OnInit} from '@angular/core';
import {UserService} from '../service/user.service';
import {NotificationMessageService} from '../service/notification-message.service';
import {Router} from '@angular/router';
import {forkJoin} from 'rxjs';
import {MessageKeys} from '../service/util/message-keys';
import {ErrorKeys} from '../service/util/error-keys';
import {LocalizationService} from '../service/localization.service';

@Component({
  selector: 'pc-new-password-reset',
  templateUrl: './new-password-reset.component.html',
  styleUrls: ['./new-password-reset.component.scss'],
})
export class NewPasswordResetComponent implements OnInit {

  email: string;

  constructor(private userService: UserService,
              private localizationService: LocalizationService,
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
    forkJoin(
      this.localizationService.getTranslation(MessageKeys.EMAIL_SENT_TITLE),
      this.localizationService.getTranslation(MessageKeys.CHECK_MAIL_FOR_PASSWORD_RESET_MESSAGE),
    ).subscribe(msgs => this.notificationMessageService.addInfo(msgs[0], msgs[1]));
    this.router.navigate(['/login']);
  }

  private onError(error: any) {
    this.localizationService.getTranslation(MessageKeys.EMAIL_COULD_NOT_BE_SENT_TITLE)
      .subscribe(msg => this.notificationMessageService.addError(msg, error));
  }
}
