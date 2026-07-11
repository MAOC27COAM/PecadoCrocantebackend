import { EventEmitter } from 'events';
export declare const orderEvents: EventEmitter<[never]>;
export declare enum OrderEvent {
    CREATED = "order:created",
    STATUS_CHANGED = "order:status_changed"
}
