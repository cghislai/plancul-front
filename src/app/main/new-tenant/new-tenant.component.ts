import { Component, OnInit } from '@angular/core';
import {Observable, Subscription} from 'rxjs';

@Component({
  selector: 'pc-new-tenant',
  templateUrl: './new-tenant.component.html',
  styleUrls: ['./new-tenant.component.scss']
})
export class NewTenantComponent implements OnInit {

  private redirectUrl: Observable<string | null>;
  private subscription: Subscription;

  constructor() { }

  ngOnInit() {
  }

}
