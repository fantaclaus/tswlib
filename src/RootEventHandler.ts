import { ElmEventMapItem } from "./types";

interface IEvent
{
	target: any;
	type: string;
	preventDefault(): void;
}

export class RootEventHandler
{
	private eventHandlerDrivers = new Map<string, EventHandlerDriver>();
	private eventHandlers = new Map<Element, ElmEventMapItem[]>();

	constructor(private htmlElement: Element)
	{
	}
	attachElmEventHandler(el: Element, elmEventMapItem: ElmEventMapItem)
	{
		let elmEventMapItems = this.eventHandlers.get(el);
		if (elmEventMapItems == null)
		{
			elmEventMapItems = [];
			this.eventHandlers.set(el, elmEventMapItems);
		}

		elmEventMapItems.push(elmEventMapItem);

		const ehd = this.getEventHandlerDriver(elmEventMapItem.eventType);
		ehd.attachEventListener(elmEventMapItem.eventName);
	}
	detachElmEventHandlers(el: Element)
	{
		let elmHandlers = this.eventHandlers.get(el);
		if (elmHandlers)
		{
			elmHandlers.forEach(elmEventMapItem =>
			{
				const ehd = this.getEventHandlerDriver(elmEventMapItem.eventType);
				ehd.detachEventListener(elmEventMapItem.eventName);
			});
		}

		this.eventHandlers.delete(el);

		// this.dumpAttachedEvents();
	}
	hasHandlers()
	{
		for (let [,ehd] of this.eventHandlerDrivers)
		{
			if (ehd.hasHandlers()) return true;
		}
		return false;
	}
	getEventHandlerDriver(eventType: string)
	{
		let ehd = this.eventHandlerDrivers.get(eventType);
		if (ehd == null)
		{
			const ehdType = EventHandlerDriver.DriverTypes.get(eventType);
			if (ehdType == null) throw new Error(`EventHandlerDriver is not found for eventType='${eventType}'`);

			ehd = new ehdType(this.htmlElement, this.eventHandlers);
			this.eventHandlerDrivers.set(eventType, ehd);
		}

		return ehd;
	}
}

export class EventHandlerDriver
{
	static DriverTypes = new Map<string, typeof EventHandlerDriver>();

	protected attachedEventListeners = new Map<string, number>();

	constructor(protected htmlElement: Element, private eventHandlers: Map<Element, ElmEventMapItem[]>)
	{
	}
	hasHandlers()
	{
		return this.eventHandlers.size > 0;
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

	getEventType(): string
	{
		throw new Error("Not implemented");
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

			for (let i of result.elmHandlersItems)
			{
				i.handleEvent.call(result.htmlElement, e);
			}
		}
	}
	private findEventHandlers(htmlElement: Element | null, eventName: string)
	{
		const eventType = this.getEventType();

		while (htmlElement && htmlElement != this.htmlElement)
		{
			const elmHandlers = this.eventHandlers.get(htmlElement);
			if (elmHandlers)
			{
				const elmHandlersItems = elmHandlers.filter(i => i.eventName == eventName);
				if (elmHandlersItems.length > 0)
				{
					const elmHandlersItems2 = elmHandlers.filter(i => i.eventType == eventType);

					return { htmlElement, elmHandlersItems: elmHandlersItems2 };
				}
			}

			const parentNode = htmlElement.parentNode as Element;
			htmlElement = parentNode;

			// NOTE: in IE 11 parentElement of SVG element is undefined

			// const parentNode = htmlElement.parentNode;
			// htmlElement = parentNode instanceof Element ? parentNode : null;
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

export class EventHandlerDriverDom extends EventHandlerDriver
{
	static EventType = 'dom';

	protected eventsListener = this.handleEvent.bind(this);

	getEventType(): string
	{
		return EventHandlerDriverDom.EventType;
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

EventHandlerDriver.DriverTypes.set(EventHandlerDriverDom.EventType, EventHandlerDriverDom);
