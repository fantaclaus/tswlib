import { ElmEventMapItem, IEvent } from "./EventHandler";

export class RootEventHandler
{
	//private htmlElement: HTMLElement;
	//private eventHandlers: Map<string, ElmEventMapItem[]>;
	protected attachedEventListeners = new Map<string, number>();

	constructor(protected htmlElement: HTMLElement, private eventHandlers: Map<string, ElmEventMapItem[]>)
	{
	}
	getEventType(): string
	{
		throw new Error("Not implemented");
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
	protected handleEvent(e: IEvent)
	{
		// console.log('handleEvent: %o for: %o', e.type, e.target);

		const htmlElm = e.target instanceof Element ? e.target : null;
		const result = this.findEventHandlers(htmlElm, e.type);
		if (result)
		{
			// console.log('on event: %o for: %o id: %s; %s', e.type, e.target, htmlElm.id, htmlElm.tagName);

			if (e.type == 'click' && result.htmlElement.tagName.toLowerCase() == 'a')
			{
				e.preventDefault();
			}

			result.elmHandlersItems.forEach(i =>
			{
				i.handler(e, result.htmlElement);
			});
		}
	}
	private findEventHandlers(htmlElement: Element | null, eventName: string)
	{
		const eventType = this.getEventType();

		while (htmlElement && htmlElement != this.htmlElement)
		{
			const elmHandlers = this.eventHandlers.get(htmlElement.id);
			if (elmHandlers)
			{
				const elmHandlersItems = elmHandlers.filter(i => i.eventType == eventType && i.eventName == eventName);
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

export class RootEventHandlerDom extends RootEventHandler
{
	protected eventsListener = (e: Event) => this.handleEvent(e);

	getEventType(): string
	{
		return 'dom';
	}
	protected addEventListener(eventName: string)
	{
		this.htmlElement.addEventListener(eventName, this.eventsListener);
	}
}

export class RootEventHandlerJQ extends RootEventHandler
{
	protected eventsListener = (e: JQuery.Event) => this.handleEvent(e);

	getEventType(): string
	{
		return 'jquery';
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
