import { EventEmitter } from 'events';

export const orderEvents = new EventEmitter();
orderEvents.setMaxListeners(50);

export enum OrderEvent {
  CREATED = 'order:created',
  STATUS_CHANGED = 'order:status_changed',
}
