import * as vis from 'vis';
import {DateType} from 'vis';
import {IdType} from 'vis';
import {SubgroupType} from 'vis';
import {WsCulture, WsCulturePhase} from '@charlyghislain/plancul-api';

export class CulturePhaseDataItem implements vis.DataItem {
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

  culture: WsCulture;
  phase: WsCulturePhase;

  constructor(culture: WsCulture, phase: WsCulturePhase, label: string, title: string) {
    this.culture = culture;
    this.phase = phase;

    const id = CulturePhaseDataItem.getCulturePhaseId(culture, phase);
    const subGroupId = CulturePhaseDataItem.getCultureSubGroupId(culture);
    const phaseName = (phase.phaseType as string).toLowerCase();

    this.id = id;
    this.content = label;
    this.title = title;
    this.start = phase.startDate;
    this.end = phase.endDate;
    this.className = `culture-phase-${phaseName}`;
    this.subgroup = subGroupId;
  }

  static getCulturePhaseId(culture: WsCulture, phase: WsCulturePhase): string {
    return `culture-phase ${culture.id} ${phase.phaseType}`;
  }

  static getCultureSubGroupId(culture: WsCulture): string {
    return `culture-subgroup ${culture.id}`;
  }
}
