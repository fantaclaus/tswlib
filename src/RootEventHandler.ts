import { ElmEventMapItem } from "./types";

interface IEvent
{
	target: any;
	type: string;
	preventDefault(): void;
}

export class tswRootEventHandler
{
	private eventHandlerDrivers = new Map<string, tswEventHandlerDriver>();
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
			const ehdType = tswEventHandlerDriver.DriverTypes.get(eventType);
			if (ehdType == null) throw new Error(`EventHandlerDriver is not found for eventType='${eventType}'`);

			ehd = new ehdType(this);
			this.eventHandlerDrivers.set(eventType, ehd);
		}

		return ehd;
	}
	findEventHandlers(htmlElement: Element | null, eventName: string, eventType: string)
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

			htmlElement = <Element>htmlElement.parentNode;
		}

		return null;
	}
}

export class tswEventHandlerDriver
{
	static DriverTypes = new Map<string, typeof tswEventHandlerDriver>();

	protected attachedEventListeners = new Map<string, number>();
	protected eventsListener = this.handleEvent.bind(this);

	constructor(protected owner: tswRootEventHandler)
	{
	}
	attachEventListener(eventName: string)
	{
		const count = this.attachedEventListeners.get(eventName) ?? 0;
		this.attachedEventListeners.set(eventName, count + 1);

		if (count == 0) this.addEventListener(eventName);
	}
	detachEventListener(eventName: string)
	{
		const count = this.attachedEventListeners.get(eventName) ?? 0;
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
		if (!(target instanceof Element)) return;

		const result = this.owner.findEventHandlers(target, e.type, this.getEventType());
		if (result == null) return;

		if (e.type == 'click' && result.htmlElement instanceof HTMLAnchorElement)
		{
			e.preventDefault();
		}

		for (const i of result.elmHandlersItems)
		{
			i.handleEvent.call(result.htmlElement, e, result.htmlElement);
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

export class tswEventHandlerDriverDom extends tswEventHandlerDriver
{
	static EventType = 'dom';

	override getEventType(): string
	{
		return tswEventHandlerDriverDom.EventType;
	}
	protected override addEventListener(eventName: string)
	{
		this.owner.htmlElement.addEventListener(eventName, this.eventsListener);
	}
	protected override removeEventListener(eventName: string)
	{
		this.owner.htmlElement.removeEventListener(eventName, this.eventsListener);
	}
}

tswEventHandlerDriver.DriverTypes.set(tswEventHandlerDriverDom.EventType, tswEventHandlerDriverDom);
