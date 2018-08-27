import {Component, OnInit} from '@angular/core';
import {LoggedUserService} from '../../main/service/logged-user.service';
import {NotificationMessageService} from '../../main/service/notification-message.service';
import {RequestService} from '../../main/service/request.service';
import {AdminService} from '../service/admin.service';

@Component({
  selector: 'pc-admin-area',
  templateUrl: './admin-area.component.html',
  styleUrls: ['./admin-area.component.scss'],
})
export class AdminAreaComponent implements OnInit {


  constructor(private loggedUserService: LoggedUserService,
              private notificationService: NotificationMessageService,
              private requestService: RequestService,
              private adminService: AdminService) {
  }

  ngOnInit() {
  }

}
