import {Component, OnInit} from '@angular/core';
import {LoggedUserService} from '../../main/service/logged-user.service';
import {WsAdminAccountUpdateRequest} from '@charlyghislain/plancul-ws-api';
import {NotificationMessageService} from '../../main/service/notification-message.service';
import {RequestService} from '../../main/service/request.service';
import {AdminService} from '../service/admin.service';

@Component({
  selector: 'pc-admin-area',
  templateUrl: './admin-area.component.html',
  styleUrls: ['./admin-area.component.scss'],
})
export class AdminAreaComponent implements OnInit {

  resetPasswordDialogVisible: boolean;
  resetPasswordInfo: WsAdminAccountUpdateRequest;

  constructor(private loggedUserService: LoggedUserService,
              private notificationService: NotificationMessageService,
              private requestService: RequestService,
              private adminService: AdminService) {
  }

  ngOnInit() {
    this.loggedUserService.checkPasswordExpired()
      .subscribe(expired => this.handlePasswordExpired(expired));
  }

  onAdminResetSaveClicked() {
    this.adminService.resetAccountInfo(this.resetPasswordInfo)
      .subscribe(() => this.onLoginInfoUpdated(),
        (error) => this.onLoginInfoError(error));
  }

  private handlePasswordExpired(expired: boolean) {
    if (!expired) {
      return;
    }
    this.resetPasswordInfo = {
      userName: null,
      password: null,
    };
    this.resetPasswordDialogVisible = true;
  }

  private onLoginInfoUpdated() {
    this.resetPasswordInfo = null;
    this.resetPasswordDialogVisible = false;
    this.notificationService.addInfo('Account saved', 'Admin account data have been updated');
  }

  private onLoginInfoError(error: any) {
    if (this.requestService.isBadRequestError(error)) {
      this.notificationService.addError('Error', 'The provided information are invalid');
    } else {
      this.notificationService.addError('Error', 'Unexpected error');
    }
  }
}
