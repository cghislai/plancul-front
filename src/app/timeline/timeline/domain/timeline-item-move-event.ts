import {WsBed, WsCulture, WsCulturePhase} from '@charlyghislain/plancul-api';

export class TimelineItemMoveEvent {
  item: vis.DataItem;
  callback: (item: vis.DataItem) => any;

  culture?: WsCulture;
  culturePhase?: WsCulturePhase;

  bed?: WsBed;
  nursery?: boolean;
}
