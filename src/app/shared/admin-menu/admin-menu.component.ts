import {Component, OnInit} from '@angular/core';
import {LoggedUserService} from '../../main/service/logged-user.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {WsApplicationGroups} from '@charlyghislain/plancul-api';

@Component({
  selector: 'pc-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.scss'],
})
export class AdminMenuComponent implements OnInit {
  adminLoggedIn$: Observable<boolean>;

  constructor(private loggedUserService: LoggedUserService,
              private router: Router) {
    this.adminLoggedIn$ = this.loggedUserService.getIsInGroupsObservable(WsApplicationGroups.ADMIN);
  }

  ngOnInit() {
  }

  isInAdminArea() {
    return this.router.url.indexOf('/admin/_') >= 0;
  }


}
