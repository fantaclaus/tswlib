import { ElementGeneric } from "./elm"
import { EventHandler } from "./EventHandler";
import { Ref } from "./ref";
import { RootEventHandler } from "./RootEventHandler";

// jQuery support

declare module "./elm"
{
	interface ElementGeneric
	{
		onclick(handler: EventHandler<JQuery.Event> | null | undefined): this;
		on(eventName: string, handler: EventHandler<JQuery.Event> | null | undefined): this;
	}
}

declare module "./ref"
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
		this.addHandler({ eventName, eventType: RootEventHandlerJQ.EventType, handler });
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

class RootEventHandlerJQ extends RootEventHandler
{
	static EventType = 'jquery';

	protected eventsListener = (e: JQuery.Event) => this.handleEvent(e);

	getEventType(): string
	{
		return RootEventHandlerJQ.EventType;
	}
	protected addEventListener(eventName: string)
	{
		jQuery(this.htmlElement).on(eventName, this.eventsListener);
	}
	protected removeEventListener(eventName: string)
	{
		jQuery(this.htmlElement).off(eventName, this.eventsListener);
	}
}

RootEventHandler.REHTypes.push(RootEventHandlerJQ);
