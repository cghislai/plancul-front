import moment from 'moment-es6';

export interface TimelineBackgroundClickEvent {
  time: moment.MomentInput;
  groupId: string;
}
