import * as vis from 'vis';

export interface TimelineItemCallbackHandler {
  item: vis.DataItem;
  callback: (item) => void;
}
