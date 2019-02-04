import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {RequestService} from '../main/service/request.service';
import {AstronomyEvent, AstronomyEventFilter} from '@charlyghislain/astronomy-api';

@Injectable({
  providedIn: 'root',
})
export class AstronomyClientService {


  constructor(private requestService: RequestService) {
  }

  searchEvents(filter: AstronomyEventFilter): Observable<AstronomyEvent[]> {
    const url = this.requestService.buildAstronomuApiUrl('/event/search');
    return this.requestService.post<AstronomyEvent[]>(url, filter);
  }

}
