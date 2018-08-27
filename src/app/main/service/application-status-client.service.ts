import {Injectable} from '@angular/core';
import {RequestService} from './request.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApplicationStatusClientService {


  constructor(private requestService: RequestService) {
  }

  isAdminAccountInitialized(): Observable<boolean> {
    const url = this.requestService.buildPlanCulApiUrl(`/application/status/adminAccountInitialized`);

    return this.requestService.get<boolean>(url);
  }


}
