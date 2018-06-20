import {Component} from '@angular/core';
import {NotificationMessageService} from './main/service/notification-message.service';
import {Observable} from 'rxjs';
import {Message} from 'primeng/api';

@Component({
  selector: 'pc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  notificationMessages: Observable<Message[]>;

  constructor(private notificationService: NotificationMessageService) {
    this.notificationMessages = this.notificationService.getMessagesObservable();
  }
}
