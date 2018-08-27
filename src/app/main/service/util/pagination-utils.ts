import {Pagination} from '../../domain/pagination';
import {Sort} from '../../domain/sort';
import {WsSortOrder} from '@charlyghislain/plancul-api';
import {LazyLoadEvent} from 'primeng/api';

export class PaginationUtils {

  static getFirstSort(pagintion: Pagination): Sort | null {
    if (pagintion.sorts == null) {
      return null;
    }
    if (pagintion.sorts.length === 0) {
      return null;
    }
    return pagintion.sorts[0];
  }

  static getPrimengOrder(sort: Sort): number {
    if (sort.order === WsSortOrder.ASC) {
      return 1;
    } else {
      return -1;
    }
  }

  static applySort(pagination: Pagination, sort: Sort): Pagination {
    return Object.assign({}, pagination, <Partial<Pagination>>{
      sorts: [sort],
    });
  }

  static applyLazyLoadEvent(pagination: Pagination, event: LazyLoadEvent): Pagination {
    const update: Partial<Pagination> = {};
    if (event.first != null) {
      update.offset = event.first;
    }
    if (event.rows != null) {
      update.length = event.rows;
    }

    return Object.assign({}, pagination, update);
  }


  static serializeSorts(sorts: Sort[] | null): string | null {
    if (sorts == null) {
      return null;
    }
    return sorts.map(sort => PaginationUtils.serializeSort(sort))
      .reduce((cur, next) => cur.length === 0 ? next : `${cur},${next}`, '');
  }

  static serializeSort(sort: Sort): string {
    return `${sort.field}:${sort.order}`;
  }

  static deserializeSort(value: string): Sort | null {
    const splitted = value.split(':');
    if (splitted.length !== 2) {
      return null;
    }
    const field = splitted[0];
    const order = <WsSortOrder>splitted[1];
    const sort: Sort = {
      field: field,
      order: order,
    };
    return sort;
  }

  static paginationEqual(pA: Pagination, pB: Pagination) {
    if (pA.offset !== pB.offset
      || pA.length !== pB.length) {
      return false;
    }
    const sortsA = PaginationUtils.serializeSorts(pA.sorts);
    const sortsB = PaginationUtils.serializeSorts(pB.sorts);
    if (sortsA !== sortsB) {
      return false;
    }
    return true;
  }

  static isValid(pagination: Pagination) {
    return pagination != null
      && pagination.offset != null
      && pagination.length != null;
  }
}
