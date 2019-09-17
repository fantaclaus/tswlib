import * as RenderUtils from './RenderUtils';
import { childValType } from './types';
import { ElmEventMapItem, EventHandler } from './EventHandler';
import { ICtxHtmlElementOwner, implements_CtxHtmlElementOwner, ICtxRoot, implements_ICtxRoot } from './interfaces';
import { appendDelimited } from "./utils";
import { Ctx } from './Ctx';
import { RootEventHandler } from './RootEventHandler';

export class CtxRoot extends Ctx implements ICtxHtmlElementOwner, ICtxRoot
{
	private [implements_CtxHtmlElementOwner] = true;
	private [implements_ICtxRoot] = true;

	private lastChildId: number | null = null;
	private htmlElement: HTMLElement;
	private id: string;
	private eventHandlers = new Map<string, ElmEventMapItem[]>();
	private rootEventHandlers = new Map<string, RootEventHandler>();

	onBeforeAttach: (() => void) | undefined;
	cleanupEventListeners = false; // unsubscribe from events on last event detached

	constructor(htmlElement: HTMLElement)
	{
		super(null); // workaround: can not pass 'this' here

		this.htmlElement = htmlElement;
		this.id = htmlElement.id || (htmlElement instanceof HTMLBodyElement ? '' : Math.random().toFixed(4).substring(2));

		RootEventHandler.REHTypes.forEach(t =>
		{
			const rh = new t(htmlElement, this.eventHandlers);
			this.rootEventHandlers.set(rh.getEventType(), rh);
		})
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
	attachElmEventHandler(elmId: string, elmEventMapItem: ElmEventMapItem)
	{
		let elmEventMapItems = this.eventHandlers.get(elmId);
		if (elmEventMapItems == null)
		{
			elmEventMapItems = [];
			this.eventHandlers.set(elmId, elmEventMapItems);
		}

		elmEventMapItems.push(elmEventMapItem);

		const rh = this.getRootEventHandler(elmEventMapItem.eventType);
		rh.attachEventListener(elmEventMapItem.eventName);

		// this.dumpAttachedEvents();
	}
	detachElmEventHandlers(elmId: string)
	{
		// by default, we only remove elm's handlers from map without detaching event listeners from this.htmlElement to improve performance
		if (this.cleanupEventListeners)
		{
			let elmHandlers = this.eventHandlers.get(elmId);
			if (elmHandlers)
			{
				elmHandlers.forEach(elmEventMapItem =>
				{
					const rh = this.getRootEventHandler(elmEventMapItem.eventType);
					rh.detachEventListener(elmEventMapItem.eventName);
				});
			}
		}

		this.eventHandlers.delete(elmId);

		// this.dumpAttachedEvents();
	}
	private getRootEventHandler(eventType: string)
	{
		const rh = this.rootEventHandlers.get(eventType);
		if (rh == null) throw new Error(`Root EventHandler is not found for eventType='${eventType}'`);

		return rh;
	}
}
