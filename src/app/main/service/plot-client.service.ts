import {Injectable} from '@angular/core';
import {WsPlot, WsPlotFilter, WsRef, WsSearchResult} from '@charlyghislain/plancul-api';
import {Observable, of} from 'rxjs';
import {RequestService} from '../../main/service/request.service';
import {Pagination} from '../../main/domain/pagination';
import {IdResourceCache} from './util/id-resource-cache';
import {RequestCache} from './util/request-cache';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PlotClientService {

  private cache = new IdResourceCache<WsPlot>();
  private requestCache = new RequestCache<WsPlot>();

  constructor(private requestService: RequestService) {
  }


  searchPlots(filter: WsPlotFilter, pagination: Pagination): Observable<WsSearchResult<WsPlot>> {
    const url = this.requestService.buildPlanCulApiUrl('/plot/search');
    return this.requestService.post<WsSearchResult<WsPlot>>(url, filter, pagination);
  }

  fetchPlot(id: number): Observable<WsPlot> {
    const url = this.requestService.buildPlanCulApiUrl(`/plot/${id}`);
    const fetchTask = this.requestService.get<WsPlot>(url)
      .pipe(tap(e => this.cache.putInCache(e)));
    const cachedTask = this.requestCache.shareInCache(id, fetchTask);
    return cachedTask;
  }

  getPlot(id: number): Observable<WsPlot> {
    const cachedPlot = this.cache.getFromCache(id);
    if (cachedPlot != null) {
      return of(cachedPlot);
    }
    const cachedRequest = this.requestCache.getFromCache(id);
    if (cachedRequest != null) {
      return cachedRequest;
    }
    return this.fetchPlot(id);
  }

  savePlot(plot: WsPlot): Observable<WsRef<WsPlot>> {
    if (plot.id == null) {
      return this.createPlot(plot);
    } else {
      return this.updatePlot(plot);
    }
  }

  createPlot(plot: WsPlot): Observable<WsRef<WsPlot>> {
    const url = this.requestService.buildPlanCulApiUrl('/plot');
    return this.requestService.post<WsRef<WsPlot>>(url, plot);
  }

  updatePlot(plot: WsPlot): Observable<WsRef<WsPlot>> {
    const url = this.requestService.buildPlanCulApiUrl(`/plot/${plot.id}`);
    return this.requestService.put<WsRef<WsPlot>>(url, plot)
      .pipe(tap(ref => this.clearCachedPlot(ref.id)));
  }

  clearCachedPlot(id: number) {
    this.cache.removeFromCache(id);
    this.requestCache.clear(id);
  }
}
