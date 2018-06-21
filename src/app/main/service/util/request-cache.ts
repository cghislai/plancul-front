import {Observable, Subscription} from 'rxjs';
import {publishReplay, refCount} from 'rxjs/operators';


export class RequestCache<T> {
  private readonly cacheSize: number = 100;
  private cache: { [id: number]: Observable<T> } = {};
  private subscriptions: { [id: number]: Subscription } = {};
  private ids: number[] = [];

  constructor(size?: number) {
    if (size != null) {
      this.cacheSize = size;
    }
  }

  shareInCache(id: number, request: Observable<T>): Observable<T> {
    const sharedRequest = request
      .pipe(publishReplay(1), refCount());

    const subscription = sharedRequest.subscribe(null, null, () => {
      this.clear(id);
    });
    this.setInCache(id, sharedRequest, subscription);
    return sharedRequest;
  }


  getFromCache(id: number): Observable<T> {
    if (!this.isInCache(id)) {
      return null;
    }
    return this.cache[id];
  }

  clear(id: number) {
    if (this.isInCache(id)) {
      const idIndex = this.ids.indexOf(id);
      this.ids.splice(idIndex, 1);
      delete this.cache[id];
      const subscription = this.subscriptions[id];
      if (subscription != null) {
        subscription.unsubscribe();
      }
      delete this.subscriptions[id];
    }
  }

  private isInCache(id: number): boolean {
    return this.cache[id] != null;
  }


  private setInCache(id: number, sharedRequest, subscription) {
    if (this.ids.length >= this.cacheSize) {
      const firstId = this.ids[0];
      this.clear(firstId);
    }
    this.cache[id] = sharedRequest;
    this.subscriptions[id] = subscription;
  }

}
