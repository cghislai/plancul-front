import * as vis from 'vis';
import {DateType} from 'vis';
import {IdType} from 'vis';
import {SubgroupType} from 'vis';
import {WsCulture, WsCulturePhase} from '@charlyghislain/plancul-api';
import {AstronomyEvent, DateAsString, MoonPhase, MoonPhaseChangeEvent} from '@charlyghislain/astronomy-api';
import {MoonPhasesDataGroup} from './moon-phases-data-group';

export class MoonPhaseEventDataItem implements vis.DataItem {
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

  event: MoonPhaseChangeEvent;
  phase: MoonPhase;

  constructor(event: MoonPhaseChangeEvent, phase: MoonPhase, title: string, start: DateAsString, end: DateAsString) {

    this.event = event;
    this.phase = phase;

    const id = MoonPhaseEventDataItem.getEventId(event, phase);
    const phaseName = phase as string;

    this.id = id;
    this.content = '';
    this.title = title;
    this.start = start;
    this.end = end;
    this.className = `moon-phase ${phaseName.toLowerCase()}`;
    this.group = MoonPhasesDataGroup.getGroupId();
    this.editable = false;
  }

  static getEventId(event: MoonPhaseChangeEvent, phase: MoonPhase): string {
    return `astronomy-event moon-phase-event ${phase} ${event.dateTime}`;
  }

  static isMoonPhaseItem(id: string) {
    return id.startsWith('astronomy-event moon-phase-event ');
  }

}
