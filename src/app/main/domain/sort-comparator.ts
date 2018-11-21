import {Sort} from './sort';

export class SortComparator {
  static equal(sortA: Sort, sortB: Sort): boolean {
    return sortA.field === sortB.field
      && sortA.order === sortB.order;
  }
}
