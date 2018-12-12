import {Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {LocalizationService} from '../../main/service/localization.service';
import {map, mergeMap, publishReplay, refCount} from 'rxjs/operators';

@Component({
  selector: 'pc-validation-errors',
  templateUrl: './validation-errors.component.html',
  styleUrls: ['./validation-errors.component.scss'],
})
export class ValidationErrorsComponent implements OnInit {

  @Input()
  set errorsKeys(value: string[]) {
    this.keySource$.next(value);
  }

  @Input()
  set errorKey(value: string) {
    this.keySource$.next([value]);
  }

  @Input()
  error: string;

  private keySource$ = new BehaviorSubject<string[]>([]);
  errors: Observable<string[]>;

  constructor(private localizationService: LocalizationService) {
  }

  ngOnInit() {
    this.errors = this.keySource$.pipe(
      mergeMap(keys => keys.length < 1 ? of([]) : forkJoin(
        keys.map(key => this.localizationService.getTranslation(key)),
      )),
      publishReplay(1), refCount(),
    );
  }

}
