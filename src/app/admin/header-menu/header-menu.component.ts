import {Component, OnInit} from '@angular/core';
import {LoggedUserService} from '../../main/service/logged-user.service';

@Component({
  selector: 'pc-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss'],
})
export class HeaderMenuComponent implements OnInit {

  constructor(private loggedUserServie: LoggedUserService) {
  }

  ngOnInit() {
  }

  onLogoutClick() {
    this.loggedUserServie.logout();
  }
}
