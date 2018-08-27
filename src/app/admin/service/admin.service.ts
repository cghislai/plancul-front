import {Injectable} from '@angular/core';
import {RequestService} from '../../main/service/request.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {

  constructor(private requestService: RequestService) {
  }

  //
  // resetAccountInfo(request: WsAdminAccountUpdateRequest): Observable<any> {
  //   return this.requestService.put('/admin/loginInfo', request);
  // }
  //
  // createNewTenant(request: WsUserTenantCreationRequest): Observable<any> {
  //   return this.requestService.post('/admin/tenant', request);
  // }
}
