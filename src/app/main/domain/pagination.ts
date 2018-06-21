import {Sort} from './sort';

export interface Pagination {
  offset: number;
  length: number;
  sorts?: Sort[];
}
