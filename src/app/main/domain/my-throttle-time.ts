import {Observable} from 'rxjs';

export function myThrottleTime<T>(time: number): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>) => {
    let timeoutHandle;
    let lastValue: T;
    let lastEmittedValue: T;
    return Observable.create((observer) => {
      let setTimeoutFn = () => {
        timeoutHandle = setTimeout(
          () => {
            if (lastEmittedValue !== lastValue) {
              lastEmittedValue = lastValue;
              observer.next(lastValue);
              setTimeoutFn();
            } else {
              timeoutHandle = undefined;
            }
          },
          time,
        );
      };

      let sourceSubscription = source
        .subscribe({
          complete: () => {
            // Should we ensure the last source value is emitted
            // when the source complete?
            // As it is used in the table services, probably:
            // We update row models as an Observable which emit the initial row, then the updated versions,
            // then completes.
            if (lastEmittedValue !== lastValue) {
              observer.next(lastValue);
            }
            observer.complete();
          },
          error: (error) => {
            observer.error(error);
          },
          next: (value: T) => {
            if (timeoutHandle === undefined) {
              setTimeoutFn();
              lastEmittedValue = value;
              observer.next(value);
            }

            lastValue = value;
          },
        });

      return () => {
        sourceSubscription.unsubscribe();
        sourceSubscription = undefined;
        lastValue = undefined;
        lastEmittedValue = undefined;
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
          timeoutHandle = undefined;
        }
        setTimeoutFn = undefined;
      };
    });
  };
}
