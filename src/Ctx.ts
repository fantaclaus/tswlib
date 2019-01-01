import { EventHandlerMap } from './types';
import * as CtxUtils from './CtxUtils';
import { Ref } from './Ref';
import * as utils from './utils';
import * as RenderUtils from './RenderUtils';
import { elmValue } from "./htmlElements";
import { childValType, Renderer } from "./types";

export abstract class Ctx
{
	private static useHierarchicalIds = false;

	private lastChildId: number | null = null;
	private childCtxs: Ctx[] | null = null;
	private parentCtx: Ctx | null = null;

	public rootCtx: CtxRoot | undefined;
	protected id: string | undefined;

	getId()
	{
		if (this.id == null) throw new Error('id is undefined');

		return this.id;
	}
	getParent()
	{
		return this.parentCtx;
	}
	getParentHtmlElmOwnerCtx()
	{
		return this.findSelfOrParent<CtxHtmlElementOwner>(ctx => ctx instanceof CtxHtmlElementOwner);
	}
	getParentUpdatableCtx()
	{
		return this.findSelfOrParent<CtxUpdatable>(ctx => ctx instanceof CtxUpdatable);
	}
	getRootCtx()
	{
		return this.rootCtx;
	}
	private findSelfOrParent<T extends Ctx>(predicate: (ctx: Ctx) => boolean)
	{
		var ctx: Ctx | null = this;

		while (ctx != null)
		{
			if (predicate(ctx)) return <T>ctx;

			ctx = ctx.parentCtx;
		}

		return null;
	}
	protected forEachChild(action: (ctx: Ctx) => void)
	{
		if (this.childCtxs) this.childCtxs.forEach(ctx => action(ctx));
	}

	addChildCtx(ctx: Ctx)
	{
		this.childCtxs = this.childCtxs || [];
		this.childCtxs.push(ctx);
		ctx.parentCtx = this;
	}
	protected removeChildren()
	{
		if (this.childCtxs)
		{
			this.childCtxs.forEach(ctx =>
			{
				ctx.removeChildren();

				ctx.parentCtx = null;
			});

			this.childCtxs = null;
		}
	}
	hasChildren(): boolean
	{
		return this.childCtxs != null && this.childCtxs.length > 0;
	}
	protected unregisterEventHandlers()
	{
		var ctxRoot = this.getRootCtx();
		if (!ctxRoot) throw new Error("root ctx is null");

		this.unregisterEventHandlersFromRoot(ctxRoot);
	}
	unregisterEventHandlersFromRoot(ctxRoot: CtxRoot)
	{
		this.forEachChild(ctx => ctx.unregisterEventHandlersFromRoot(ctxRoot));
	}
	protected afterAttach()
	{
		this.forEachChild(ctx => ctx.afterAttach());
	}
	protected beforeDetach()
	{
		this.forEachChild(ctx => ctx.beforeDetach());
	}
	protected getHtmlElement(): HTMLElement | null | undefined
	{
		const ctxElm = this.getParentHtmlElmOwnerCtx();
		return ctxElm && ctxElm.getHtmlElement();
	}

	private getNextChildId()
	{
		if (this.id == null) throw new Error('id is undefined');

		this.lastChildId = (this.lastChildId || 0) + 1;
		return utils.appendDelimited(this.id, '-', this.lastChildId.toString());
	}
	generateNextChildId(): string
	{
		const ctx = Ctx.useHierarchicalIds ? <Ctx>this : this.getRootCtx();
		if (!ctx) throw new Error("root ctx is null");

		return ctx.getNextChildId();
	}
	protected resetNextChildId()
	{
		if (Ctx.useHierarchicalIds) this.lastChildId = null;
	}

	protected _update(content: childValType)
	{
		this.beforeDetach();

		this.detachPropKeys();

		this.unregisterEventHandlers();

		this.removeChildren();
		this.resetNextChildId();

		const htmlElement = this.getHtmlElement();
		if (htmlElement)
		{
			const innerHtml = CtxScope.use(this, () => this._renderHtml(content));
			this.setInnerHtml(htmlElement, innerHtml || '');
			this.afterAttach();
		}
	}
	protected _renderHtml(content: childValType): string
	{
		throw new Error("_renderHtml is not supported by this class");
	}
	protected setInnerHtml(htmlElement: HTMLElement, innerHtml: string)
	{
		throw new Error("setInnerHtml is not supported by this class");
	}
	private detachPropKeys()
	{
		var ctxs: Ctx[] = [];
		this.collectChildContexts(ctxs);

		CtxUtils.removeCtxs(ctxs);
	}
	private collectChildContexts(ctxs: Ctx[])
	{
		ctxs.push(this);

		this.forEachChild(ctx => ctx.collectChildContexts(ctxs));
	}
}
export abstract class CtxHtmlElementOwner extends Ctx
{
	abstract getTagName(): string;
}
export class CtxElement extends CtxHtmlElementOwner
{
	private tagName: string;
	private refs: Ref[] | null;

	constructor(rootCtx: CtxRoot, id: string, tagName: string, refs: Ref[] | null)
	{
		super();

		this.rootCtx = rootCtx;
		this.id = id;
		this.tagName = tagName;
		this.refs = refs;
	}
	protected getHtmlElement()//: HTMLElement | null | undefined
	{
		if (this.id == null) throw new Error('id is undefined');

		var htmlElement = document.getElementById(this.id);
		if (!htmlElement) throw new Error(`Can not find element by id: ${this.id}`);

		return htmlElement;
	}
	getTagName(): string
	{
		return this.tagName;
	}

	unregisterEventHandlersFromRoot(ctxRoot: CtxRoot)
	{
		if (this.id == null) throw new Error('id is undefined');

		ctxRoot.detachElmEventHandlers(this.id);

		super.unregisterEventHandlersFromRoot(ctxRoot);
	}
	removeChildren()
	{
		if (this.refs)
		{
			this.refs.forEach(r => r.set(null));
			this.refs = null;
		}

		super.removeChildren();
	}
}
export class CtxRoot extends CtxHtmlElementOwner
{
	private htmlElement: HTMLElement;
	private attachedEventNames: { [eventName: string]: boolean } | null = null;
	private eventHandlers: { [elmId: string]: EventHandlerMap } | null = null;

	constructor(htmlElement: HTMLElement)
	{
		super();

		this.htmlElement = htmlElement;
		this.id = htmlElement.id;
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
	protected _renderHtml(content: childValType)
	{
		return RenderUtils.renderHtml(this, content);
	}
	protected setInnerHtml(htmlElement: HTMLElement, innerHtml: string)
	{
		htmlElement.innerHTML = innerHtml;
	}

	protected unregisterEventHandlers()
	{
		var jqElm = jQuery(this.htmlElement);
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

			//var eventHandlers = this.eventHandlers[elmId];  // DEBUG
			//if (eventHandlers) console.log('detached events for: %s: %o', elmId, eventHandlers);  // DEBUG

			delete this.eventHandlers[elmId];

			this.updateEventSubscriptions();

			//console.groupEnd();
		}
	}
	private updateEventSubscriptions()
	{
		var jqElm = jQuery(this.htmlElement);

		var currentEventNames: { [eventName: string]: boolean } = {};
		var currentEventNamesCount = 0;

		const eventHandlers = this.eventHandlers;
		if (eventHandlers)
		{
			utils.forEachKey(eventHandlers, elmId =>
			{
				var elmEventHandlers = eventHandlers[elmId];
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
		var htmlElm = <Element>e.target;
		var r = this.findEventHandlers(htmlElm);
		if (r)
		{
			var eventHandler = r.ehMap[e.type];
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
			var elmId = htmlElement.id;

			var elmEventHandlers = elmId && this.eventHandlers && this.eventHandlers[elmId];
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
export abstract class CtxUpdatable extends Ctx
{
	abstract update(): void;
}
export class CtxUpdatableChild extends CtxUpdatable
{
	content: childValType;

	constructor(rootCtx: CtxRoot, id: string, content: childValType)
	{
		super();

		this.rootCtx = rootCtx;
		this.id = id;
		this.content = content;
	}
	update()
	{
		this._update(this.content);
	}
	protected _renderHtml(content: childValType)
	{
		var ctxRoot = this.getRootCtx();
		if (!ctxRoot) throw new Error("root ctx is null");

		return RenderUtils.getRenderedHtml(ctxRoot, content);
	}
	protected setInnerHtml(htmlElement: HTMLElement, innerHtml: string)
	{
		if (this.id == null) throw new Error('id is undefined');

		//console.log("CtxUpdatableChild.update: %o %s", htmlElement, this.id);

		RenderUtils.updateInnerHtml(htmlElement, this.id, innerHtml);
	}
	protected afterAttach()
	{
		super.afterAttach();

		var renderer = <Renderer>this.content;
		if (renderer.afterAttach) renderer.afterAttach();
	}
	protected beforeDetach()
	{
		super.beforeDetach();

		var renderer = <Renderer>this.content;
		if (renderer.beforeDetach) renderer.beforeDetach();
	}
}
export class CtxUpdatableAttr extends CtxUpdatable
{
	//attrName: string;
	//renderFn: () => string | null;

	constructor(rootCtx: CtxRoot, public attrName: string, public renderFn: () => string | null)
	{
		super();

		this.rootCtx = rootCtx;
	}
	update()
	{
		var htmlElement = this.getHtmlElement();
		if (!htmlElement) throw new Error("htmlElement is undefined");
		//console.log("%o update: %o %s", this, htmlElement, this.attrName);

		var v = CtxScope.use(this, () => this.renderFn());

		//console.log("%o update: %o %s = %o", this, htmlElement, this.attrName, v);

		var jqElement = jQuery(htmlElement);

		// attributes checked and value can be changed only by $.prop()

		if (this.attrName == 'checked')
		{
			jqElement.prop('checked', v != null);
		}
		else if (this.attrName == 'value')
		{
			jqElement.prop('value', v || '');
		}
		else
		{
			if (v == null)
				jqElement.removeAttr(this.attrName);
			else
				jqElement.attr(this.attrName, v);
		}
	}
}
export class CtxUpdatableValue extends CtxUpdatable
{
	// private propName: string;
	// private renderFn: () => elmValue;

	getRenderFn() { return this.renderFn; }

	constructor(rootCtx: CtxRoot, public propName: string, public renderFn: () => elmValue)
	{
		super();

		this.rootCtx = rootCtx;
	}
	update()
	{
		var htmlElement = this.getHtmlElement();
		if (!htmlElement) throw new Error("htmlElement is undefined");

		var val = CtxScope.use(this, () => this.renderFn());
		//console.log("%o update: %o %s = %o", this, htmlElement, this.propName, val);

		var jqElement = jQuery(htmlElement);
		jqElement.prop(this.propName, <string & number & boolean>val);
	}
}
export class CtxScope
{
	private static contexts: Ctx[] = [];

	static getCurrentSafe()
	{
		const ctx = this.getCurrent();
		if (ctx == null) throw new Error("No current context.");

		return ctx;
	}
	static getCurrent()
	{
		const contexts = this.contexts;
		return contexts.length == 0 ? null : contexts[contexts.length - 1];
	}

	static use<T>(ctx: Ctx, action: () => T): T
	{
		this.contexts.push(ctx);

		try
		{
			return action();
		}
		finally
		{
			this.contexts.pop();
		}
	}
}
