import { CtxHtmlElementOwner } from "./Ctx";
import * as RenderUtils from './RenderUtils';
import { childValType, EventHandlerMap } from './types';
import * as utils from './utils';

export class CtxRoot extends CtxHtmlElementOwner
{
	private htmlElement: HTMLElement;
	private attachedEventNames: { [eventName: string]: boolean } | null = null;
	private eventHandlers: { [elmId: string]: EventHandlerMap } | null = null;

	constructor(htmlElement: HTMLElement)
	{
		super(null); // workaround: can not pass this here

		this.htmlElement = htmlElement;
		this.id = htmlElement.id;
	}
	getTagName()
	{
		return this.htmlElement.tagName;
	}
	getHtmlElement()
	{
		return this.htmlElement;
	}
	setContent(content: childValType)
	{
		this._update(content);
	}
	protected _renderHtml(content: childValType): string
	{
		return RenderUtils.renderHtml(this, content);
	}
	protected setInnerHtml(htmlElement: HTMLElement, innerHtml: string)
	{
		htmlElement.innerHTML = innerHtml;
	}

	protected unregisterEventHandlers()
	{
		const jqElm = jQuery(this.htmlElement);
		jqElm.off();
		this.attachedEventNames = null;
		this.eventHandlers = null;
	}
	attachElmEventHandlers(elmId: string, eventHandlers: EventHandlerMap)
	{
		//console.group('attached events for: %s: %o', elmId, eventHandlers);

		this.eventHandlers = this.eventHandlers || {};
		this.eventHandlers[elmId] = eventHandlers;

		this.updateEventSubscriptions();

		//console.groupEnd();
	}
	detachElmEventHandlers(elmId: string)
	{
		if (this.eventHandlers)
		{
			//console.group('detachElmEventHandlers: %s', elmId);

			//const eventHandlers = this.eventHandlers[elmId];  // DEBUG
			//if (eventHandlers) console.log('detached events for: %s: %o', elmId, eventHandlers);  // DEBUG

			delete this.eventHandlers[elmId];

			this.updateEventSubscriptions();

			//console.groupEnd();
		}
	}
	private updateEventSubscriptions()
	{
		const jqElm = jQuery(this.htmlElement);

		const currentEventNames: { [eventName: string]: boolean } = {};
		let currentEventNamesCount = 0;

		const eventHandlers = this.eventHandlers;
		if (eventHandlers)
		{
			utils.forEachKey(eventHandlers, elmId =>
			{
				const elmEventHandlers = eventHandlers[elmId];
				utils.forEachKey(elmEventHandlers, eventName =>
				{
					currentEventNames[eventName] = true;
					currentEventNamesCount++;
				});
			});
		}

		if (this.attachedEventNames)
		{
			utils.forEachKey(this.attachedEventNames, eventName =>
			{
				if (!(eventName in currentEventNames))
				{
					//console.log("unsubscribe from event: %s", eventName);
					jqElm.off(eventName);
				}
			});
		}

		utils.forEachKey(currentEventNames, eventName =>
		{
			if (!this.attachedEventNames || !(eventName in this.attachedEventNames))
			{
				//console.log("subscribe to event: %s", eventName);

				jqElm.on(eventName, (e: JQuery.Event) =>
				{
					//console.log('on event: %s on %o', e.type, e.target);
					this.handleEvent(e);
				});
			}
		});

		this.attachedEventNames = currentEventNamesCount == 0 ? null : currentEventNames;
	}
	private handleEvent(e: JQuery.Event)
	{
		const htmlElm = <Element>e.target;
		const r = this.findEventHandlers(htmlElm);
		if (r)
		{
			const eventHandler = r.ehMap[e.type];
			if (eventHandler)
			{
				// console.log('on event: %o for: %o id: %s; %s', e.type, e.target, htmlElm.id, htmlElm.tagName);

				if (e.type == 'click' && r.htmlElm.tagName.toLowerCase() == 'a')
				{
					e.preventDefault();
				}

				eventHandler(e, r.htmlElm);
			}
		}
	}
	private findEventHandlers(htmlElement: Element | null)
	{
		while (htmlElement && htmlElement != this.htmlElement)
		{
			const elmId = htmlElement.id;

			const elmEventHandlers = elmId && this.eventHandlers && this.eventHandlers[elmId];
			if (elmEventHandlers) return ({
				htmlElm: htmlElement,
				ehMap: elmEventHandlers,
			});

			// NOTE: in IE 11 parentElement of SVG tag is undefined

			const parentNode = htmlElement.parentNode;
			htmlElement = parentNode instanceof Element ? <Element>parentNode : null;
		}

		return null;
	}
}
