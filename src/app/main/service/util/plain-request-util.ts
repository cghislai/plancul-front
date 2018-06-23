import {Observable, Observer, Subscription} from 'rxjs';

export class PlainRequestUtil {

  static getAsString(url: string): Observable<string> {
    const request = new XMLHttpRequest();
    const subscription = new Subscription(() => {
      if (request) {
        request.abort();
      }
    });
    return Observable.create((observer: Observer<string>) => {
      request.open('GET', url);

      request.onreadystatechange = function () {
        if (request.readyState !== 4) {
          return;
        }
        if (request.status !== 200 && request.status !== 204) {
          observer.error(new Error('XMLHttpRequest Error: ' + request.status + ' : ' + request.statusText));
          return;
        }
        observer.next(request.responseText);
        observer.complete();
      };
      request.onerror = function () {
        observer.error(new Error('XMLHttpRequest Error: ' + request.statusText));
      };
      request.send();
      return subscription;
    });
  }

}
