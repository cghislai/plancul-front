import {Component, OnInit} from '@angular/core';
import {WsUserTenantCreationRequest} from '@charlyghislain/plancul-ws-api';
import {AdminService} from '../service/admin.service';
import {NotificationMessageService} from '../../main/service/notification-message.service';
import {RequestService} from '../../main/service/request.service';

@Component({
  selector: 'pc-new-tenant-form',
  templateUrl: './new-tenant-form.component.html',
  styleUrls: ['./new-tenant-form.component.scss'],
})
export class NewTenantFormComponent implements OnInit {

  formData: WsUserTenantCreationRequest;

  constructor(private adminService: AdminService,
              private notificationService: NotificationMessageService,
              private requestService: RequestService,
  ) {
  }

  ngOnInit() {
    this.resetFormData();
  }

  onSubmit() {
    this.adminService.createNewTenant(this.formData)
      .subscribe(() => this.onCreationSuccess(),
        (error) => this.onCreationError(error));
  }

  private resetFormData() {
    this.formData = {
      firstName: null,
      lastName: null,
      email: null,
      tenant: {
        id: null,
        name: null,
      },
    };
  }

  private onCreationSuccess() {
    const email = this.formData.email;
    this.notificationService.addInfo('Tenant created', `An email has been sent to ${email}`);
    this.resetFormData();
  }

  private onCreationError(error: any) {
    if (this.requestService.isBadRequestError(error)) {
      this.notificationService.addError('Error', 'The provided information are invalid');
    } else {
      this.notificationService.addError('Error', 'Unexpected error');
    }
  }
}
