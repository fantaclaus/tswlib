import { tswElement, privates } from "./elm"
import { tswRef } from "./ref";
import { EventHandler, EventKind } from "./types";
import { tswEventHandlerDriver } from "./RootEventHandler";

// jQuery support

declare module "./elm"
{
	interface tswElement
	{
		onclick(handler: EventHandler<JQuery.Event> | null | undefined): this;
		on(eventName: string, handler: EventHandler<JQuery.Event> | null | undefined): this;
	}
}

declare module "./ref"
{
	interface tswRef
	{
		asJQuery(): JQuery;
	}
}

tswElement.prototype.on = function (eventName: string, handler: EventHandler<JQuery.Event> | null | undefined)
{
	if (eventName && handler instanceof Function)
	{
		this[privates.ElementGeneric.addHandler]({
			eventName,
			eventType: tswEventHandlerDriverJQ.EventType,
			handleEvent: handler,
			eventKind: EventKind.onRoot,
		});
	}

	return this;
};

tswElement.prototype.onclick = function (handler: EventHandler<JQuery.Event> | null | undefined)
{
	return this.on('click', handler);
};

tswRef.prototype.asJQuery = function ()
{
	return jQuery(this.asHtmlElement());
};

class tswEventHandlerDriverJQ extends tswEventHandlerDriver
{
	static EventType = 'jquery';

	getEventType(): string
	{
		return tswEventHandlerDriverJQ.EventType;
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

tswEventHandlerDriver.DriverTypes.set(tswEventHandlerDriverJQ.EventType, tswEventHandlerDriverJQ);

