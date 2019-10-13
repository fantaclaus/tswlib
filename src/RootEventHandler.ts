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
	private eventHandlers = new Map<Node, ElmEventMapItem[]>();

	constructor(public htmlElement: Element)
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
		return this.eventHandlers.size > 0;
	}
	getEventHandlerDriver(eventType: string)
	{
		let ehd = this.eventHandlerDrivers.get(eventType);
		if (ehd == null)
		{
			const ehdType = EventHandlerDriver.DriverTypes.get(eventType);
			if (ehdType == null) throw new Error(`EventHandlerDriver is not found for eventType='${eventType}'`);

			ehd = new ehdType(this);
			this.eventHandlerDrivers.set(eventType, ehd);
		}

		return ehd;
	}
	findEventHandlers(htmlElement: Node | null, eventName: string, eventType: string)
	{
		while (htmlElement && htmlElement != this.htmlElement)
		{
			const elmHandlersItems1 = this.eventHandlers.get(htmlElement);
			if (elmHandlersItems1)
			{
				const elmHandlersItems2 = elmHandlersItems1.filter(i => i.eventName == eventName);
				if (elmHandlersItems2.length > 0)
				{
					const elmHandlersItems3 = elmHandlersItems2.filter(i => i.eventType == eventType);

					return { htmlElement, elmHandlersItems: elmHandlersItems3 };
				}
			}

			// NOTE: in IE 11 parentElement of SVG element is undefined, so we use parentNode

			const parentNode = htmlElement.parentNode;
			htmlElement = parentNode;
		}

		return null;
	}
}

export class EventHandlerDriver
{
	static DriverTypes = new Map<string, typeof EventHandlerDriver>();

	protected attachedEventListeners = new Map<string, number>();
	protected eventsListener = this.handleEvent.bind(this);

	constructor(protected owner: RootEventHandler)
	{
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
		const target = e.target;
		if (!(target instanceof Node)) return;

		const result = this.owner.findEventHandlers(target, e.type, this.getEventType());
		if (result == null) return;

		if (e.type == 'click' && result.htmlElement instanceof HTMLAnchorElement)
		{
			e.preventDefault();
		}

		for (let i of result.elmHandlersItems)
		{
			i.handleEvent.call(result.htmlElement, e);
		}
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

	getEventType(): string
	{
		return EventHandlerDriverDom.EventType;
	}
	protected addEventListener(eventName: string)
	{
		this.owner.htmlElement.addEventListener(eventName, this.eventsListener);
	}
	protected removeEventListener(eventName: string)
	{
		this.owner.htmlElement.removeEventListener(eventName, this.eventsListener);
	}
}

EventHandlerDriver.DriverTypes.set(EventHandlerDriverDom.EventType, EventHandlerDriverDom);
