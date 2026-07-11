import { EventEmitter } from 'events';
export const orderEvents = new EventEmitter();
orderEvents.setMaxListeners(50);
export var OrderEvent;
(function (OrderEvent) {
    OrderEvent["CREATED"] = "order:created";
    OrderEvent["STATUS_CHANGED"] = "order:status_changed";
})(OrderEvent || (OrderEvent = {}));
