import * as vis from 'vis';
import {DateType, IdType, SubgroupType} from 'vis';
import {DateAsString, Zodiac, ZodiakChangeEvent} from '@charlyghislain/astronomy-api';
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
    this.content = MoonZodiacEventDataItem.getContentChar(event.zodiac);
    this.title = title;
    this.start = start;
    this.end = end;
    this.className = `moon-zodiac ${zodiacName.toLowerCase()} ${elementName.toLowerCase()}`;
    this.group = MoonZodiacsDataGroup.getGroupId();
    this.editable = false;
  }

  static getEventId(event: ZodiakChangeEvent): string {
    return `astronomy-event moon-zodiac-event ${event.zodiac} ${event.dateTime}`;
  }

  static getUnrenderedId(): string {
    return `astronomy-event moon-zodiac-event unrendered`;
  }

  static isMoonZodiacEvent(id: string) {
    return id.startsWith('astronomy-event moon-zodiac-event ');
  }

  private static getContentChar(zodiac: Zodiac) {
    switch (zodiac) {
      case Zodiac.ARIES:
        return '♈';
      case Zodiac.TAURUS:
        return '♉';
      case Zodiac.GEMINI:
        return '♊';
      case Zodiac.CANCER:
        return '♋';
      case Zodiac.LEO:
        return '♌';
      case Zodiac.VIRGO:
        return '♍';
      case Zodiac.LIBRA:
        return '♎';
      case Zodiac.SCORPIO:
        return '♏';
      case Zodiac.SAGITTARIUS:
        return '♐';
      case Zodiac.CAPRICORN:
        return '♑';
      case Zodiac.AQUARIUS:
        return '♒';
      case Zodiac.PISCES:
        return '♓';
    }
  }
}
