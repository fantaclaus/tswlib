import { CtxHtmlElementOwner } from "./Ctx";
import * as RenderUtils from './RenderUtils';
import { childValType, EventHandlerMap } from './types';

export class CtxRoot extends CtxHtmlElementOwner
{
	private htmlElement: HTMLElement;
	private attachedEventListeners = new Set<string>();
	private eventHandlers = new Map<string, EventHandlerMap>();
	private _listener = this.handleEvent.bind(this);

	onBeforeAttach: (() => void) | undefined;

	constructor(htmlElement: HTMLElement)
	{
		super(null); // workaround: can not pass this here

		this.htmlElement = htmlElement;
		this.id = htmlElement.id || (htmlElement instanceof HTMLBodyElement ? undefined : Math.random().toFixed(4).substring(2));
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
	protected beforeAttach()
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
		this.attachedEventListeners.forEach((eventName) => this.htmlElement.removeEventListener(eventName, this._listener));
		this.attachedEventListeners.clear();
		this.eventHandlers.clear();
	}
	attachElmEventHandlers(elmId: string, eventHandlers: EventHandlerMap)
	{
		if (this.eventHandlers.has(elmId)) throw new Error(`this.eventHandlers already has elmId=${elmId}`);

		//console.group('attached events for: %s: %o', elmId, eventHandlers);
		this.eventHandlers.set(elmId, eventHandlers);

		for (const eventName of eventHandlers.keys())
		{
			if (!this.attachedEventListeners.has(eventName))
			{
				this.htmlElement.addEventListener(eventName, this._listener);

				this.attachedEventListeners.add(eventName);
			}
		}

		//console.groupEnd();
	}
	detachElmEventHandlers(elmId: string)
	{
		// we only remove elm's handlers from map without detaching event listeners from this.htmlElement for optimization sake
		this.eventHandlers.delete(elmId);
	}
	private handleEvent(e: Event)
	{
		const htmlElm = <Element>e.target;
		const r = this.findEventHandlers(htmlElm);
		if (r)
		{
			const eventHandler = r.ehMap.get(e.type);
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
			const elmEventHandlers = elmId && this.eventHandlers.get(elmId);
			if (elmEventHandlers) return ({
				htmlElm: htmlElement,
				ehMap: elmEventHandlers,
			});

			// NOTE: in IE 11 parentElement of SVG element is undefined

			const parentNode = htmlElement.parentNode;
			htmlElement = parentNode instanceof Element ? <Element>parentNode : null;
		}

		return null;
	}
}
