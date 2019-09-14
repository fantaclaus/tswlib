import * as RenderUtils from './RenderUtils';
import { childValType } from './types';
import { EventHandlerMap, EventHandler } from './EventHandler';
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
	private attachedEventListeners = new Map<string, number>();
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
	attachElmEventHandlers(elmId: string, eventHandlerMap: EventHandlerMap)
	{
		//console.group('attached events for: %s: %o', elmId, eventHandlers);

		let elmHandlerMaps = this.eventHandlers.get(elmId);
		if (elmHandlerMaps == null)
		{
			elmHandlerMaps = [];
			this.eventHandlers.set(elmId, elmHandlerMaps);
		}

		elmHandlerMaps.push(eventHandlerMap);

		// attach root handler if needed

		eventHandlerMap.forEach((h, eventName) =>
		{
			const count = this.attachedEventListeners.get(eventName) || 0;
			if (count == 0)
			{
				this.htmlElement.addEventListener(eventName, this.eventsListener);
			}

			this.attachedEventListeners.set(eventName, count + 1);
		})

		//console.groupEnd();

		// this.dumpAttachedEvents();
	}
	detachElmEventHandlers(elmId: string)
	{
		// this.removeEventListeners(elmId);

		// we only remove elm's handlers from map without detaching event listeners from this.htmlElement for optimization sake
		this.eventHandlers.delete(elmId);

		// this.dumpAttachedEvents();
	}
	private removeEventListeners(elmId: string)
	{
		let elmHandlerMaps = this.eventHandlers.get(elmId);
		if (elmHandlerMaps)
		{
			elmHandlerMaps.forEach((eventHandlerMap) =>
			{
				eventHandlerMap.forEach((h, eventName) =>
				{
					const count = this.attachedEventListeners.get(eventName) || 0;

					const countNew = count - 1;

					if (countNew == 0)
					{
						this.htmlElement.removeEventListener(eventName, this.eventsListener);

						this.attachedEventListeners.delete(eventName);
					}
					else
					{
						this.attachedEventListeners.set(eventName, count - 1);
					}
				});
			});
		}
	}
	private dumpAttachedEvents()
	{
		let s = '';
		this.attachedEventListeners.forEach((count, eventName) =>
		{
			s += `${eventName}=${count}; `;
		});
		console.log('eventHandlers: ', this.eventHandlers.size, ' attachedEventListeners:', s);
	}
	private handleEvent(e: Event)
	{
		const htmlElm = e.target instanceof Element ? e.target : null;
		const r = this.findEventHandlers(htmlElm, e.type);
		if (r)
		{
			r.ehs.forEach(eventHandler =>
			{
				// console.log('on event: %o for: %o id: %s; %s', e.type, e.target, htmlElm.id, htmlElm.tagName);

				if (e.type == 'click' && r.htmlElement.tagName.toLowerCase() == 'a')
				{
					e.preventDefault();
				}

				eventHandler(e, r.htmlElement);
			});
		}
	}
	private findEventHandlers(htmlElement: Element | null, eType: string)
	{
		while (htmlElement && htmlElement != this.htmlElement)
		{
			const elmEventHandlers = this.eventHandlers.get(htmlElement.id);
			if (elmEventHandlers)
			{
				let ehs: EventHandler[] | undefined;

				elmEventHandlers.forEach(i =>
				{
					const eh = i.get(eType);
					if (eh)
					{
						if (!ehs) ehs = [];
						ehs.push(eh);
					}
				})

				if (ehs)
				{
					return { htmlElement, ehs };
				}
			}

			// NOTE: in IE 11 parentElement of SVG element is undefined

			const parentNode = htmlElement.parentNode;
			htmlElement = parentNode instanceof Element ? parentNode : null;
		}

		return null;
	}
}
