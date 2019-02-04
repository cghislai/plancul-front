import * as vis from 'vis';
import {DataGroupOptions, IdType, SubGroupStackOptions} from 'vis';
import {WsBed} from '@charlyghislain/plancul-api';

export class PatchDataGroup implements vis.DataGroup {
  className?: string;
  content: string;
  id: IdType;
  options?: DataGroupOptions;
  style?: string;
  subgroupOrder?: string | (() => void);
  title?: string;
  nestedGroups?: number[];
  subgroupStack?: SubGroupStackOptions | boolean;

  patch: string;
  beds: WsBed[];

  constructor(patch: string, beds: WsBed[]) {
    this.patch = patch;
    this.beds = beds;

    this.id = this.getId();
    this.content = `${patch}`;
    this.title = `${patch}`;
    this.className = `patch-data-group`;
  }

  private getId(): string {
    return `patch ${this.patch}`;
  }
}
