import * as vis from 'vis';
import {DateType} from 'vis';
import {IdType} from 'vis';
import {SubgroupType} from 'vis';
import {WsCulture, WsCulturePhase, WsRef} from '@charlyghislain/plancul-api';

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
  private loading: boolean;

  constructor(culture: WsCulture, phase: WsCulturePhase, label: string, title: string) {
    this.culture = culture;
    this.phase = phase;

    const id = CulturePhaseDataItem.getCulturePhaseId(culture, phase);
    const subGroupId = CulturePhaseDataItem.getCultureSubGroupId(culture);

    this.id = id;
    this.content = label;
    this.title = title;
    this.start = phase.startDate;
    this.end = phase.endDate;
    this.className = CulturePhaseDataItem.createCssClass(this);
    this.subgroup = subGroupId;
    this.editable = true;
  }

  static getCulturePhaseId(culture: WsCulture | WsRef<WsCulture>, phase: WsCulturePhase): string {
    return `culture-phase ${culture.id} ${phase.phaseType}`;
  }

  static getCultureSubGroupId(culture: WsCulture | WsRef<WsCulture>): string {
    return `culture-subgroup ${culture.id}`;
  }

  static isCulturePhaseItem(item: vis.DataItem) {
    return this.isCulturePhaseItemId(item.id as string);
  }

  static isCulturePhaseItemId(itemId: string) {
    return itemId.startsWith('culture-phase ');
  }

  static getCultureIdFromItemId(itemId: string) {
    if (this.isCulturePhaseItemId(itemId)) {
      const stringId = itemId.split(' ')[1];
      const id = parseInt(stringId, 10);
      if (isNaN(id)) {
        return null;
      } else {
        return id;
      }
    }
    return null;
  }

  static createCssClass(item: CulturePhaseDataItem) {
    const phaseName = (item.phase.phaseType as string).toLowerCase();
    const loadingClass = item.loading ? 'loading' : '';
    return `culture-phase ${phaseName} ${loadingClass}`;
  }

  static setLoading(item: CulturePhaseDataItem, loading: boolean) {
    item.loading = loading;
    item.editable = !loading;
    item.className = this.createCssClass(item);
  }

}
