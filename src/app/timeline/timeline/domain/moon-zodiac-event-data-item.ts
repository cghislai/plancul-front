import * as vis from 'vis';
import {DateType, IdType, SubgroupType} from 'vis';
import {DateAsString, ZodiakChangeEvent} from '@charlyghislain/astronomy-api';
import {MoonZodiacsDataGroup} from './moon-zodiacs-data-group';
import {ZodiacElement} from '../../../main/service/util/zodiac-element';

export class MoonZodiacEventDataItem implements vis.DataItem {
  className?: string;
  content: string;
  end?: DateType;
  group?: any;
  id?: IdType;
  start: DateType;
  style?: string;
  subgroup?: SubgroupType;
  title?: string;
  type?: string;
  editable?: boolean;

  event: ZodiakChangeEvent;
  element: ZodiacElement;

  constructor(event: ZodiakChangeEvent, element: ZodiacElement, title: string, start: DateAsString, end: DateAsString) {
    this.event = event;
    this.element = element;

    const id = MoonZodiacEventDataItem.getEventId(event);
    const zodiacName = event.zodiac as string;
    const elementName = element as string;

    this.id = id;
    this.content = '';
    this.title = title;
    this.start = start;
    this.end = end;
    this.className = `moon-zodiac ${zodiacName.toLowerCase()} ${elementName.toLowerCase()}`;
    this.group = MoonZodiacsDataGroup.getGroupId();
  }

  static getEventId(event: ZodiakChangeEvent): string {
    return `astronomy-event moon-zodiac-event ${event.zodiac} ${event.dateTime}`;
  }

  static getUnrenderedId(): string {
    return `astronomy-event moon-zodiac-event unrendered`;
  }
}
