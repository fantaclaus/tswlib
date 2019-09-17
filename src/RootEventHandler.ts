import { ElmEventMapItem } from "./EventHandler";

interface IEvent
{
	target: any;
	type: string;
	preventDefault(): void;
}

export class RootEventHandler
{
	static REHTypes: (typeof RootEventHandler)[] = [];

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
	attachEventListener(eventName: string)
	{
		const count = this.attachedEventListeners.get(eventName) || 0;
		this.attachedEventListeners.set(eventName, count + 1);

		if (count == 0) this.addEventListener(eventName);
	}
	detachEventListener(eventName: string)
	{
		const count = this.attachedEventListeners.get(eventName) || 0;
		const countNew = count - 1;

		if (countNew > 0)
		{
			this.attachedEventListeners.set(eventName, countNew);
		}
		else
		{
			this.removeEventListener(eventName);

			this.attachedEventListeners.delete(eventName);
		}
	}
	protected addEventListener(eventName: string)
	{
		throw new Error("Not implemented");
	}
	protected removeEventListener(eventName: string)
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
	// private dumpAttachedEvents()
	// {
	// 	let s = '';
	// 	this.attachedEventListeners.forEach((count, eventName) =>
	// 	{
	// 		s += `${eventName}=${count}; `;
	// 	});
	// 	console.log('eventHandlers: ', this.eventHandlers.size, ' attachedEventListeners:', s);
	// }
}

export class RootEventHandlerDom extends RootEventHandler
{
	static EventType = 'dom';

	protected eventsListener = (e: Event) => this.handleEvent(e);

	getEventType(): string
	{
		return RootEventHandlerDom.EventType;
	}
	protected addEventListener(eventName: string)
	{
		this.htmlElement.addEventListener(eventName, this.eventsListener);
	}
	protected removeEventListener(eventName: string)
	{
		this.htmlElement.removeEventListener(eventName, this.eventsListener);
	}
}

RootEventHandler.REHTypes.push(RootEventHandlerDom);
