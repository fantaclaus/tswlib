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
		if (this.eventHandlers && elmId in this.eventHandlers) throw new Error(`this.eventHandlers already has elmId=${elmId}`);

		this.eventHandlers = this.eventHandlers || {};
		this.eventHandlers[elmId] = eventHandlers;

		for (const eventName in eventHandlers)
		{
			this.attachedEventNames = this.attachedEventNames || {};

			if (!(eventName in this.attachedEventNames))
			{
				const jqElm = jQuery(this.htmlElement);
				jqElm.on(eventName, e =>
				{
					this.handleEvent(e);
				});

				this.attachedEventNames[eventName] = true;
			}
		}

		//console.groupEnd();
	}
	detachElmEventHandlers(elmId: string)
	{
		if (this.eventHandlers)
		{
			//console.group('detachElmEventHandlers: %s', elmId);

			//const eventHandlers = this.eventHandlers[elmId];  // DEBUG
			//if (eventHandlers) console.log('detached events for: %s: %o', elmId, eventHandlers);  // DEBUG

			// we only remove elm's handlers from map without detaching event listeners from this.htmlElement for optimization sake
			delete this.eventHandlers[elmId];

			//console.groupEnd();
		}
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
