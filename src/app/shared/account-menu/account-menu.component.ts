import {Component, OnInit} from '@angular/core';
import {LoggedUserService} from '../../main/service/logged-user.service';
import {Observable} from 'rxjs';
import {map, publishReplay, refCount} from 'rxjs/operators';
import {Router} from '@angular/router';
import {WsApplicationGroups} from '@charlyghislain/plancul-api';

@Component({
  selector: 'pc-account-menu',
  templateUrl: './account-menu.component.html',
  styleUrls: ['./account-menu.component.scss'],
})
export class AccountMenuComponent implements OnInit {

  loggedUserName$: Observable<string | null>;
  isUserLogged$: Observable<boolean>;

  constructor(private loggedUserService: LoggedUserService,
              private router: Router) {
    this.isUserLogged$ = loggedUserService.getHasEitherGroupObservable(WsApplicationGroups.TENANT_USER);
    this.loggedUserName$ = loggedUserService.getUserObservable().pipe(
      map(user => user == null ? '' : `${user.firstName} ${user.lastName}`),
      publishReplay(1), refCount(),
    );
  }

  ngOnInit() {
  }

  onLogoutClick() {
    this.loggedUserService.logout();
    window.location.reload();
  }

}
