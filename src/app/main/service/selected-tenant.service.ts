import {Injectable} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {WsPlot, WsPlotFilter, WsRef, WsTenant, WsTenantRole, WsTenantUserRole} from '@charlyghislain/plancul-ws-api';
import {LoggedUserService} from './logged-user.service';
import {map, publishReplay, refCount, switchMap, tap} from 'rxjs/operators';
import {TenantClientService} from './tenant-client.service';
import {WsRefUtils} from './util/ws-ref-utils';
import {Pagination} from '../domain/pagination';
import {PlotClientService} from './plot-client.service';

@Injectable({
  providedIn: 'root',
})
export class SelectedTenantService {

  private availableTenants: Observable<WsTenant[]>;
  private selectedTenantRef = new BehaviorSubject<WsRef<WsTenant>>(null);
  private selectedTenantRole = new BehaviorSubject<WsTenantRole>(null);

  private availablePlotRefs: Observable<WsRef<WsPlot>[]>;
  private defaultPlotRef: Observable<WsRef<WsPlot>>;

  constructor(private loggedUserService: LoggedUserService,
              private plotClient: PlotClientService,
              private tenantClient: TenantClientService) {
    this.availableTenants = loggedUserService.getTenantRolesObservable()
      .pipe(
        tap(tenantsRoles => this.updateSelectionFromAvailablity(tenantsRoles)),
        switchMap(tenantRoles => this.fetchTenants(tenantRoles)),
        publishReplay(1), refCount(),
      );
    this.availableTenants.subscribe();
    this.availablePlotRefs = this.selectedTenantRef.pipe(
      switchMap(ref => this.searchTenantPlots(ref)),
      map(results => results.list),
      publishReplay(1), refCount(),
    );
    this.defaultPlotRef = this.availablePlotRefs.pipe(
      map(plots => plots[0]),
      publishReplay(1), refCount(),
    );
  }

  getSelectedTenantRef(): Observable<WsRef<WsTenant> | null> {
    return this.selectedTenantRef;
  }

  getSelectedTenantRole(): Observable<WsTenantRole | null> {
    return this.selectedTenantRole;
  }

  getAvailableTenants(): Observable<WsTenant[]> {
    return this.availableTenants;
  }

  getAvailablePlotRefs(): Observable<WsRef<WsPlot>[]> {
    return this.availablePlotRefs;
  }

  getDefaultPlotRef(): Observable<WsRef<WsPlot>> {
    return this.defaultPlotRef;
  }

  private updateSelectionFromAvailablity(tenantsRoles: WsTenantUserRole[]) {
    const curSelection = this.selectedTenantRef.getValue();
    const availableSelectedTenantRole = tenantsRoles
      .find(role => WsRefUtils.isSameRef(role.tenantWsRef, curSelection));

    if (availableSelectedTenantRole != null) {
      this.selectedTenantRole.next(availableSelectedTenantRole.role);
      return;
    }
    if (tenantsRoles.length > 0) {
      const newSelectedRole = tenantsRoles[0];
      this.selectedTenantRef.next(newSelectedRole.tenantWsRef);
      this.selectedTenantRole.next(newSelectedRole.role);
    } else {
      this.selectedTenantRef.next(null);
      this.selectedTenantRole.next(null);
    }
  }

  private fetchTenants(tenantRoles: WsTenantUserRole[]) {
    const taskList = tenantRoles.map(role => role.tenantWsRef)
      .map(ref => this.tenantClient.getTenant(ref.id));
    return taskList.length === 0 ? of([]) : forkJoin(taskList);
  }

  private searchTenantPlots(ref: WsRef<WsPlot>) {
    const filter: WsPlotFilter = {
      tenantRef: ref,
      nameContains: null,
    };
    const pagination: Pagination = {
      offset: 0,
      length: 10,
    };
    return this.plotClient.searchPlots(filter, pagination);
  }
}
