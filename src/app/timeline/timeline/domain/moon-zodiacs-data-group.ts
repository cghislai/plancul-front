import * as vis from 'vis';
import {DataGroupOptions, IdType, SubGroupStackOptions} from 'vis';

export class MoonZodiacsDataGroup implements vis.DataGroup {
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
    this.id = MoonZodiacsDataGroup.getGroupId();
    this.content = label;
    this.title = label;
    this.className = `moon-zodiacs-group`;
  }

  static getGroupId() {
    return `moon-zodiacs`;
  }
}
