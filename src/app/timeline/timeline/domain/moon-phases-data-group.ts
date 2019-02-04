import * as vis from 'vis';
import {DataGroupOptions, IdType, SubGroupStackOptions} from 'vis';

export class MoonPhasesDataGroup implements vis.DataGroup {
  className?: string;
  content: string;
  id: IdType;
  options?: DataGroupOptions;
  style?: string;
  subgroupOrder?: string | (() => void);
  title?: string;
  nestedGroups?: number[];
  subgroupStack?: SubGroupStackOptions | boolean;

  constructor(label: string) {
    this.id = this.getId();
    this.content = label;
    this.title = label;
    this.className = `moon-phases-group`;
  }

  static getGroupId() {
    return `moon-phases`;
  }

  private getId() {
    return MoonPhasesDataGroup.getGroupId();
  }
}
