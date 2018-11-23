import {Component, OnInit} from '@angular/core';
import {AdminService} from '../service/admin.service';
import {BehaviorSubject, forkJoin, Observable, ReplaySubject, Subject, Subscription} from 'rxjs';
import {WsUser} from '@charlyghislain/plancul-api';
import {Pagination} from '../../main/domain/pagination';
import {filter, map, publishReplay, refCount, switchMap} from 'rxjs/operators';
import {LazyLoadEvent} from 'primeng/api';
import {UserService} from '../../main/service/user.service';

@Component({
  selector: 'pc-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit {

  pagination$ = new BehaviorSubject<Pagination>({
    offset: 0, length: 50,
  });
  users$: Observable<WsUser[]>;
  curPageOffset$: Observable<number>;
  curPageLength$: Observable<number>;
  totalCount$: Observable<number>;

  constructor(private adminService: AdminService,
              private userService: UserService) {
  }

  ngOnInit() {
    const userResults = this.pagination$.pipe(
      filter(p => p != null),
      switchMap(p => this.adminService.searchUsers(p)),
      publishReplay(1), refCount(),
    );
    this.users$ = userResults.pipe(
      map(r => r.list),
      map(refs => refs.map(ref => this.userService.fetchUser(ref.id))),
      switchMap(refTasks$ => forkJoin(refTasks$)),
      publishReplay(1), refCount(),
    );
    this.curPageOffset$ = this.pagination$.pipe(
      map(p => p.offset),
      publishReplay(1), refCount(),
    );
    this.curPageLength$ = this.pagination$.pipe(
      map(p => p.length),
      publishReplay(1), refCount(),
    );
    this.totalCount$ = userResults.pipe(
      map(r => r.count),
      publishReplay(1), refCount(),
    );
  }

  onLazyLoad(event: LazyLoadEvent) {
    if (event.first == null || event.rows == null) {
      return;
    }
    this.pagination$.next({
      offset: event.first,
      length: event.rows,
    });
  }

}
