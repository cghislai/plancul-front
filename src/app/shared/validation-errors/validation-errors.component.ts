import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'pc-validation-errors',
  templateUrl: './validation-errors.component.html',
  styleUrls: ['./validation-errors.component.scss'],
})
export class ValidationErrorsComponent implements OnInit {

  @Input()
  errors: string[];
  @Input()
  error: string;

  constructor() {
  }

  ngOnInit() {
  }

}
