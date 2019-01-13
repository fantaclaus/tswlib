import * as RenderUtils from './RenderUtils';
import { childValType, EventHandlerMap } from './types';
import { ICtxHtmlElementOwner, implements_CtxHtmlElementOwner, ICtxRoot, implements_ICtxRoot } from './interfaces';
import { appendDelimited } from "./utils";
import { Ctx } from './Ctx';

export class CtxRoot extends Ctx implements ICtxHtmlElementOwner, ICtxRoot
{
	private [implements_CtxHtmlElementOwner] = true;
	private [implements_ICtxRoot] = true;

	private lastChildId: number | null = null;
	private htmlElement: HTMLElement;
	private id: string;
	private attachedEventListeners = new Set<string>();
	private eventHandlers = new Map<string, EventHandlerMap[]>();
	private eventsListener = this.handleEvent.bind(this);

	onBeforeAttach: (() => void) | undefined;

	constructor(htmlElement: HTMLElement)
	{
		super(null); // workaround: can not pass 'this' here

		this.htmlElement = htmlElement;
		this.id = htmlElement.id || (htmlElement instanceof HTMLBodyElement ? '' : Math.random().toFixed(4).substring(2));
	}
	getRootCtx()
	{
		return this;
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
	getNextChildId()
	{
		this.lastChildId = (this.lastChildId || 0) + 1;
		return appendDelimited(this.id, '-', this.lastChildId.toString());
	}
	beforeAttach()
	{
		if (this.onBeforeAttach) this.onBeforeAttach();
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
		this.attachedEventListeners.forEach(eventName => this.htmlElement.removeEventListener(eventName, this.eventsListener));
		this.attachedEventListeners.clear();
		this.eventHandlers.clear();
	}
	attachElmEventHandlers(elmId: string, eventHandlers: EventHandlerMap)
	{
		//console.group('attached events for: %s: %o', elmId, eventHandlers);

		let elmHandlers = this.eventHandlers.get(elmId);
		if (elmHandlers == null)
		{
			elmHandlers = [];
			this.eventHandlers.set(elmId, elmHandlers);
		}

		elmHandlers.push(eventHandlers);

		// attach root handler if needed

		eventHandlers.forEach((v, eventName) =>
		{
			if (!this.attachedEventListeners.has(eventName))
			{
				this.htmlElement.addEventListener(eventName, this.eventsListener);

				this.attachedEventListeners.add(eventName);
			}
		})

		//console.groupEnd();
	}
	detachElmEventHandlers(elmId: string)
	{
		// we only remove elm's handlers from map without detaching event listeners from this.htmlElement for optimization sake
		this.eventHandlers.delete(elmId);
	}
	private handleEvent(e: Event)
	{
		const htmlElm = e.target instanceof Element ? e.target : null;
		const r = this.findEventHandlers(htmlElm);
		if (r)
		{
			r.ehMaps.forEach(ehMap =>
			{
				const eventHandler = ehMap.get(e.type);
				if (eventHandler)
				{
					// console.log('on event: %o for: %o id: %s; %s', e.type, e.target, htmlElm.id, htmlElm.tagName);

					if (e.type == 'click' && r.htmlElm.tagName.toLowerCase() == 'a')
					{
						e.preventDefault();
					}

					eventHandler(e, r.htmlElm);
				}
			});
		}
	}
	private findEventHandlers(htmlElement: Element | null)
	{
		while (htmlElement && htmlElement != this.htmlElement)
		{
			const elmEventHandlers = this.eventHandlers.get(htmlElement.id);
			if (elmEventHandlers) return ({
				htmlElm: htmlElement,
				ehMaps: elmEventHandlers,
			});

			// NOTE: in IE 11 parentElement of SVG element is undefined

			const parentNode = htmlElement.parentNode;
			htmlElement = parentNode instanceof Element ? parentNode : null;
		}

		return null;
	}
}
