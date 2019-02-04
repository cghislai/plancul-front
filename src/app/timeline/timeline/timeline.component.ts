import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import * as vis from 'vis';
import {BehaviorSubject, Subscription} from 'rxjs';
import moment from 'moment-es6';
import {DateUtils} from '../../main/service/util/date-utils';
import {WsDateRange} from '@charlyghislain/plancul-api';
import {distinctUntilChanged} from 'rxjs/operators';
import {TimelineService} from '../beds-timeline/service/timeline.service';
import {TimelineItemMoveEvent} from './domain/timeline-item-move-event';
import {CulturePhaseDataItem} from './domain/culture-phase-data-item';
import {BedDataGroup} from './domain/bed-data-group';
import {NurseryDataGroup} from './domain/nursery-data-group';
import {MoonPhaseEventDataItem} from './domain/moon-phase-event-data-item';
import {MoonZodiacEventDataItem} from './domain/moon-zodiac-event-data-item';
import {TimelineBackgroundClickEvent} from './domain/timeline-background-click-event';

@Component({
  selector: 'pc-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit, AfterViewInit, OnDestroy {


  @Input()
  set data(items: vis.DataItem[]) {
    if (items == null) {
      return;
    }
    this.itemsSource.next(items);
  }

  @Input()
  set groups(items: vis.DataSet<vis.DataGroup>) {
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
  private itemMoving = new EventEmitter<TimelineItemMoveEvent>();
  @Output()
  private itemMoved = new EventEmitter<TimelineItemMoveEvent>();
  @Output()
  private backgroundClick = new EventEmitter<TimelineBackgroundClickEvent>();

  @ViewChild('timelineContainer')
  private container: ElementRef;

  private timeline: vis.Timeline;
  private subscription: Subscription;

  // Used as buffers until timeline created
  private itemsSource = new BehaviorSubject<vis.DataItem[]>([]);
  private groupsSource = new BehaviorSubject<vis.DataSet<vis.DataGroup>>(null);
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
    template: (item, element, data) => this.createItemTemplate(item, element, data),
    zoomMin: 1000 * 60 * 60 * 24 * 4,
    zoomMax: 1000 * 60 * 60 * 24 * 365 * 5,
    // zoomKey: 'ctrlKey',
    start: this.initialRange == null ? moment().add(-1, 'week') : this.initialRange.start,
    end: this.initialRange == null ? moment().add(2, 'week') : this.initialRange.end,
    onMoving: (item, callback) => this.itemMoving.next(this.createMovingEvent(item, callback)),
    onMove: (item, callback) => this.itemMoved.next(this.createMovingEvent(item, callback)),
    snap: (date: Date, scale: string, step: number) => this.snapDate(date, scale, step),
    moment: (date) => this.createMoment(date),
  });

  constructor(private timelineService: TimelineService) {
  }

  ngOnInit() {
    this.timeline = new vis.Timeline(this.container.nativeElement,
      this.itemsSource.getValue(),
      this.groupsSource.getValue(),
      this.optionsSource.getValue(),
    );

    this.timeline.on('rangechanged', e => this.onRangeChanged(e));
    this.timeline.on('doubleClick', e => this.onDoubleClick(e));
    this.timeline.on('select', e => this.onItemSelect(e));

    this.subscription = this.itemsSource.pipe(
      distinctUntilChanged(),
    ).subscribe(items => {
      if (this.timeline) {
        this.timeline.setItems(items);
      }
    });
  }

  ngAfterViewInit() {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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

  private onDoubleClick(event: any) {
    const what = event.what;

    switch (what) {
      case 'background': {
        this.backgroundClick.emit(this.createBackgroundClickEvent(event));
        break;
      }
    }
  }

  private onItemSelect(event: any) {
    const itemIds: string[] = event.items;
    console.log(itemIds);
    const filtered = itemIds.filter(id => this.isItemIdSelectable(id));

    this.timeline.setSelection(filtered);
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

  private createItemTemplate(item: vis.DataItem, element: any, data: any) {
    return this.timelineService.createItemHtmlTemplate(item);
  }

  private createMovingEvent(item: vis.DataItem, callback: (item: vis.DataItem) => any): TimelineItemMoveEvent {
    let culture, phase, bed, nursery;
    if (CulturePhaseDataItem.isCulturePhaseItem(item)) {
      const phaseItem = item as CulturePhaseDataItem;
      culture = phaseItem.culture;
      phase = phaseItem.phase;
    }
    const groups = this.groupsSource.getValue();
    if (groups != null) {
      const itemGroupId = groups.getIds().find(id => id === item.group);
      if (itemGroupId != null) {
        if (BedDataGroup.isBedGroup(itemGroupId as string)) {
          const itemGroup = groups.get(itemGroupId);
          const bedGroup = itemGroup as BedDataGroup;
          bed = bedGroup.bed;
        } else if (itemGroupId === NurseryDataGroup.getGroupId()) {
          nursery = true;
        }

      }
    }

    return {
      item: item,
      callback: callback,
      culture: culture,
      culturePhase: phase,
      bed: bed,
      nursery: nursery,
    };
  }

  private createBackgroundClickEvent(event: any): TimelineBackgroundClickEvent {
    const time = event.snappedTime;
    const timeMoment = moment(time);
    const groupId = event.group;
    return {
      groupId: groupId,
      time: timeMoment,
    };
  }

  private isItemIdSelectable(id: string) {
    if (MoonPhaseEventDataItem.isMoonPhaseItem(id)) {
      return false;
    }
    if (MoonZodiacEventDataItem.isMoonZodiacEvent(id)) {
      return false;
    }
    return true;
  }
}
