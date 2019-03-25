import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {ScrollEvent} from '../domain/scroll-event';


@Injectable()
export class ContentScrollService {

  private scrollEvents$ = new Subject<ScrollEvent>();

  constructor() {
  }

  fireScroll(htmlEvent: any) {
    const element: HTMLElement = htmlEvent.target;
    const top: number = (element.scrollTop || document.body.scrollTop) + element.offsetHeight;
    const left: number = (element.scrollLeft || document.body.scrollLeft) + element.offsetWidth;
    const event: ScrollEvent = {
      element: element,
      top: top,
      left: left,
    };
    this.scrollEvents$.next(event);
  }

  getScrollEvents$(): Observable<ScrollEvent> {
    return this.scrollEvents$.asObservable();
  }
}
