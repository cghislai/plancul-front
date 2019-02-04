import * as vis from 'vis';
import {IdType} from 'vis';
import {DataGroupOptions} from 'vis';
import {SubGroupStackOptions} from 'vis';
import {WsBed, WsRef} from '@charlyghislain/plancul-api';

export class BedDataGroup implements vis.DataGroup {
  className?: string;
  content: string;
  id: IdType;
  options?: DataGroupOptions;
  style?: string;
  subgroupOrder?: string | (() => void);
  title?: string;
  nestedGroups?: number[];
  subgroupStack?: SubGroupStackOptions | boolean;

  bed: WsBed;

  constructor(bed: WsBed) {
    this.bed = bed;
    this.id = this.getId();
    this.content = `${bed.name}`;
    this.title = `${bed.name}`;
    this.subgroupStack = true;
    this.className = `bed-data-group`;
  }

  static getBedGroupId(bed: WsBed | WsRef<WsBed>) {
    return `bed ${bed.id}`;
  }

  private getId() {
    return BedDataGroup.getBedGroupId(this.bed);
  }
}
