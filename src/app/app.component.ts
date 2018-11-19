import {Component, Inject} from '@angular/core';
import {NotificationMessageService} from './main/service/notification-message.service';
import {Observable} from 'rxjs';
import {Message} from 'primeng/api';
import {PlanCulApplicationInfo} from './main/domain/plan-cul-application-info';
import {PLAN_CUL_APP_INFO} from './main/service/util/app-info-token';

@Component({
  selector: 'pc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {


  constructor(@Inject(PLAN_CUL_APP_INFO)
              public appInfo: PlanCulApplicationInfo) {
  }
}
