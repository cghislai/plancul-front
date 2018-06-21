import {Component, OnInit} from '@angular/core';
import {LoggedUserService} from '../service/logged-user.service';
import {SelectedTenantService} from '../service/selected-tenant.service';

@Component({
  selector: 'pc-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  constructor(private loggedUserService: LoggedUserService,
              private selectedTenantService: SelectedTenantService) {
  }

  ngOnInit() {
  }

  onLogoutClick() {
    this.loggedUserService.logout();
  }
}
