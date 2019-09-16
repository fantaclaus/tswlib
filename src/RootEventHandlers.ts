import { ElmEventMapItem, EventHandler } from "./EventHandler";

export class RootEventHandlers
{
	//private htmlElement: HTMLElement;
	//private eventHandlers: Map<string, ElmEventMapItem[]>;
	protected attachedEventListeners = new Map<string, number>();

	constructor(protected htmlElement: HTMLElement, private eventHandlers: Map<string, ElmEventMapItem[]>)
	{
	}
	attachEventListenerIfNeeded(elmEventMapItem: ElmEventMapItem)
	{
		const eventName = elmEventMapItem.eventName;

		const count = this.attachedEventListeners.get(eventName) || 0;
		this.attachedEventListeners.set(eventName, count + 1);

		if (count == 0) this.addEventListener(eventName);
	}
	protected addEventListener(eventName: string)
	{
		throw new Error("Not implemented");
	}
	protected handleEvent(e: JQuery.Event | Event, isJQuery: boolean)
	{
		// console.log('handleEvent: %o for: %o', e.type, e.target);

		const htmlElm = e.target instanceof Element ? e.target : null;
		const result = this.findEventHandlers(htmlElm, e.type, isJQuery);
		if (result)
		{
			// console.log('on event: %o for: %o id: %s; %s', e.type, e.target, htmlElm.id, htmlElm.tagName);

			if (e.type == 'click' && result.htmlElement.tagName.toLowerCase() == 'a')
			{
				e.preventDefault();
			}

			result.elmHandlersItems.forEach(i =>
			{
				if (this.isJQueryHandler(i.handler) && this.isJQueryEvent(e, isJQuery))
				{
					i.handler(e, result.htmlElement);
				}
				else if (!this.isJQueryHandler(i.handler) && !this.isJQueryEvent(e, isJQuery))
				{
					i.handler(e, result.htmlElement);
				}
				else
				{
					throw new Error("Argument type mismatch");
				}
			});
		}
	}
	protected isJQueryHandler(cb: EventHandler<JQuery.Event> | EventHandler<Event>): cb is EventHandler<JQuery.Event>
	{
		return true;
	}
	protected isJQueryEvent(e: JQuery.Event | Event, isJQuery: boolean): e is JQuery.Event
	{
		return isJQuery;
	}
	private findEventHandlers(htmlElement: Element | null, eventName: string, isJQuery: boolean)
	{
		while (htmlElement && htmlElement != this.htmlElement)
		{
			const elmHandlers = this.eventHandlers.get(htmlElement.id);
			if (elmHandlers)
			{
				const elmHandlersItems = elmHandlers.filter(i => i.isJQuery === isJQuery && i.eventName == eventName);
				if (elmHandlersItems.length > 0)
				{
					return { htmlElement, elmHandlersItems };
				}
			}

			// NOTE: in IE 11 parentElement of SVG element is undefined

			const parentNode = htmlElement.parentNode;
			htmlElement = parentNode instanceof Element ? parentNode : null;
		}

		return null;
	}
}

export class RootEventHandlersDom extends RootEventHandlers
{
	protected eventsListener = (e: Event) => this.handleEvent(e, false);

	protected isJQueryHandler(cb: EventHandler<JQuery.Event> | EventHandler<Event>): cb is EventHandler<JQuery.Event>
	{
		return false;
	}
	protected addEventListener(eventName: string)
	{
		this.htmlElement.addEventListener(eventName, this.eventsListener);
	}
}

export class RootEventHandlersJQ extends RootEventHandlers
{
	protected eventsListener = (e: JQuery.Event) => this.handleEvent(e, true);

	protected isJQueryHandler(cb: EventHandler<JQuery.Event> | EventHandler<Event>): cb is EventHandler<JQuery.Event>
	{
		return true;
	}
	protected addEventListener(eventName: string)
	{
		jQuery(this.htmlElement).on(eventName, this.eventsListener);
	}
}

// private removeEventListeners(elmId: string)
// {
// 	let elmHandlers = this.eventHandlers.get(elmId);
// 	if (elmHandlers)
// 	{
// 		elmHandlers.forEach(i =>
// 		{
// 			const eventName = i.eventName;

// 			const count = this.attachedEventListeners.get(eventName) || 0;

// 			const countNew = count - 1;

// 			if (countNew == 0)
// 			{
// 				this.htmlElement.removeEventListener(eventName, this.eventsListener);

// 				this.attachedEventListeners.delete(eventName);
// 			}
// 			else
// 			{
// 				this.attachedEventListeners.set(eventName, count - 1);
// 			}
// 		});
// 	}
// }
// private dumpAttachedEvents()
// {
// 	let s = '';
// 	this.attachedEventListeners.forEach((count, eventName) =>
// 	{
// 		s += `${eventName}=${count}; `;
// 	});
// 	console.log('eventHandlers: ', this.eventHandlers.size, ' attachedEventListeners:', s);
// }
