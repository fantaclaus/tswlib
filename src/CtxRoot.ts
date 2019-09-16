import * as RenderUtils from './RenderUtils';
import { childValType } from './types';
import { ElmEventMapItem, EventHandler } from './EventHandler';
import { ICtxHtmlElementOwner, implements_CtxHtmlElementOwner, ICtxRoot, implements_ICtxRoot } from './interfaces';
import { appendDelimited } from "./utils";
import { Ctx } from './Ctx';
import { RootEventHandlers, RootEventHandlersDom, RootEventHandlersJQ } from './RootEventHandlers';

export class CtxRoot extends Ctx implements ICtxHtmlElementOwner, ICtxRoot
{
	private [implements_CtxHtmlElementOwner] = true;
	private [implements_ICtxRoot] = true;

	private lastChildId: number | null = null;
	private htmlElement: HTMLElement;
	private id: string;
	private eventHandlers = new Map<string, ElmEventMapItem[]>();
	private rootHandlersDom: RootEventHandlers;
	private rootHandlersJQ: RootEventHandlers;

	onBeforeAttach: (() => void) | undefined;

	constructor(htmlElement: HTMLElement)
	{
		super(null); // workaround: can not pass 'this' here

		this.htmlElement = htmlElement;
		this.id = htmlElement.id || (htmlElement instanceof HTMLBodyElement ? '' : Math.random().toFixed(4).substring(2));

		this.rootHandlersDom = new RootEventHandlersDom(htmlElement, this.eventHandlers);
		this.rootHandlersJQ = new RootEventHandlersJQ(htmlElement, this.eventHandlers);
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
	attachElmEventHandlers(elmId: string, ...elmEventHandlers: ElmEventMapItem[])
	{
		let elmHandlers = this.eventHandlers.get(elmId);
		if (elmHandlers == null)
		{
			elmHandlers = [];
			this.eventHandlers.set(elmId, elmHandlers);
		}

		elmHandlers.push(...elmEventHandlers);

		elmEventHandlers.forEach(elmEventHandler =>
		{
			const rh = elmEventHandler.isJQuery ? this.rootHandlersJQ : this.rootHandlersDom;
			rh.attachEventListenerIfNeeded(elmEventHandler);
		})

		// if (elmEventHandlers instanceof Array)
		// {
		// 	elmHandlers.push(...elmEventHandlers);

		// 	elmEventHandlers.forEach(elmEventHandler =>
		// 	{
		// 		this.attachEventListenerIfNeeded(elmEventHandler);
		// 	})
		// }
		// else
		// {
		// 	elmHandlers.push(elmEventHandlers);

		// 	this.attachEventListenerIfNeeded(elmEventHandlers);
		// }

		// this.dumpAttachedEvents();
	}
	detachElmEventHandlers(elmId: string)
	{
		// this.removeEventListeners(elmId);

		// we only remove elm's handlers from map without detaching event listeners from this.htmlElement for optimization sake
		this.eventHandlers.delete(elmId);

		// this.dumpAttachedEvents();
	}
}
