import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import * as vis from 'vis';
import {BehaviorSubject} from 'rxjs';
import moment from 'moment-es6';
import {DateUtils} from '../../main/service/util/date-utils';
import {TimelineItemCallbackHandler} from './timeline-item-callback-handler';
import {WsDateRange} from '@charlyghislain/plancul-api';

@Component({
  selector: 'pc-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit, AfterViewInit {


  @Input()
  set data(items: vis.DataItem[]) {
    if (items == null) {
      return;
    }
    this.itemsSource.next(items);
    if (this.timeline) {
      this.timeline.setItems(items);
    }
  }

  @Input()
  set groups(items: vis.DataGroup[]) {
    if (items == null) {
      return;
    }
    this.groupsSource.next(items);
    if (this.timeline) {
      this.timeline.setGroups(items);
    }
  }

  @Input()
  set options(options: vis.Options) {
    if (options == null) {
      return;
    }
    const curOptions = this.optionsSource.getValue();
    const newOptions = Object.assign({}, curOptions, options);

    this.optionsSource.next(newOptions);
    if (this.timeline) {
      this.timeline.setOptions(newOptions);
    }
  }

  @Input()
  private initialRange: WsDateRange;
  @Input()
  loading: boolean;

  @Output()
  private rangeChanged = new EventEmitter<WsDateRange>();
  @Output()
  private itemMoving = new EventEmitter<TimelineItemCallbackHandler>();
  @Output()
  private itemMoved = new EventEmitter<TimelineItemCallbackHandler>();

  @ViewChild('timelineContainer')
  private container: ElementRef;

  private timeline: vis.Timeline;

  // Used as buffers until timeline created
  private itemsSource = new BehaviorSubject<vis.DataItem[]>([]);
  private groupsSource = new BehaviorSubject<vis.DataGroup[]>([]);
  private optionsSource = new BehaviorSubject<any>({
    stack: false,
    stackSubgroups: true,
    editable: {
      add: false,         // add new items by double tapping
      updateTime: true,  // drag items horizontally
      updateGroup: true, // drag items from one group to another
      remove: false,       // delete an item by tapping the delete button top right
      overrideItems: false,  // allow these options to override item.editable
    },
    tooltip: {
      followMouse: true,
    },
    tooltipOnItemUpdateTime: {
      template: (item, element, data) => this.createMovingItemTooltipTemplate(item, element, data),
    },
    zoomMin: 1000 * 60 * 60 * 24 * 4,
    zoomMax: 1000 * 60 * 60 * 24 * 365 * 5,
    // zoomKey: 'ctrlKey',
    start: this.initialRange == null ? moment().add(-1, 'week') : this.initialRange.start,
    end: this.initialRange == null ? moment().add(2, 'week') : this.initialRange.end,
    onMoving: (item, callback) => this.itemMoving.next({
      item: item,
      callback: callback,
    }),
    onMove: (item, callback) => this.itemMoved.next({
      item: item,
      callback: callback,
    }),
    snap: (date: Date, scale: string, step: number) => this.snapDate(date, scale, step),
    moment: (date) => this.createMoment(date),
  });

  constructor() {
  }

  ngOnInit() {
    this.timeline = new vis.Timeline(this.container.nativeElement,
      this.itemsSource.getValue(),
      this.groupsSource.getValue(),
      this.optionsSource.getValue(),
    );
    console.log('timeline');

    this.timeline.on('rangechanged', e => this.onRangeChanged(e));
  }

  ngAfterViewInit() {
  }

  private onRangeChanged(event: any) {
    const start = moment(event.start);
    const end = moment(event.end);

    const dateRange: WsDateRange = {
      start: DateUtils.toIsoDateString(start.toDate()),
      end: DateUtils.toIsoDateString(end.toDate()),
    };

    this.rangeChanged.emit(dateRange);
  }

  private snapDate(date: Date, scale: string, step: number): Date {
    const updatedDate = moment.utc(date)
      .startOf('day')
      .toDate();
    return updatedDate;
  }

  private createMoment(date: any) {
    const m = moment(date).utc(false).startOf('day');
    return m;
  }

  private createMovingItemTooltipTemplate(item: vis.DataItem, element: any, data: any) {
    // TODO i18n
    const startDate = moment(item.start).format('DD/MM/YYYY');
    const endDate = moment(item.end).format('DD/MM/YYYY');

    const htmlContent = `
      <div>${startDate} - ${endDate}</div>
    `;
    return htmlContent;
  }
}
