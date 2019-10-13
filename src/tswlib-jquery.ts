import { ElementGeneric } from "./elm"
import { Ref } from "./ref";
import { EventHandler, privates, EventKind } from "./types";
import { EventHandlerDriver } from "./RootEventHandler";

// jQuery support

declare module "tswlibDom/elm"
{
	interface ElementGeneric
	{
		onclick(handler: EventHandler<JQuery.Event> | null | undefined): this;
		on(eventName: string, handler: EventHandler<JQuery.Event> | null | undefined): this;
	}
}

declare module "tswlibDom/ref"
{
	interface Ref
	{
		asJQuery(): JQuery;
	}
}

ElementGeneric.prototype.on = function (eventName: string, handler: EventHandler<JQuery.Event> | null | undefined)
{
	if (eventName && handler instanceof Function)
	{
		this[privates.ElementGeneric.addHandler]({
			eventName,
			eventType: EventHandlerDriverJQ.EventType,
			handleEvent: handler,
			eventKind: EventKind.onRoot,
		});
	}

	return this;
};

ElementGeneric.prototype.onclick = function (handler: EventHandler<JQuery.Event> | null | undefined)
{
	return this.on('click', handler);
};

Ref.prototype.asJQuery = function ()
{
	return jQuery(this.asHtmlElement());
};

class EventHandlerDriverJQ extends EventHandlerDriver
{
	static EventType = 'jquery';

	getEventType(): string
	{
		return EventHandlerDriverJQ.EventType;
	}
	protected addEventListener(eventName: string)
	{
		jQuery(this.owner.htmlElement).on(eventName, this.eventsListener);
	}
	protected removeEventListener(eventName: string)
	{
		jQuery(this.owner.htmlElement).off(eventName, this.eventsListener);
	}
}

EventHandlerDriver.DriverTypes.set(EventHandlerDriverJQ.EventType, EventHandlerDriverJQ);

