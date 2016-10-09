import { EventHandlerMap } from './elm';
import { CtxUtils } from './CtxUtils';
import { Ref } from './Ref';
import { utils, objUtils } from './utils';
import { RenderUtils } from './RenderUtils';
//import "jquery";

export function setContent(htmlElement: HTMLElement, content: any): void
{
	var ctxRoot = new CtxRoot();
	ctxRoot.render(content, htmlElement);
}

export interface Renderer
{
	render: () => any;
	afterAttach?: () => void;
	beforeDetach?: () => void;
}

interface HtmlElementEvents
{
	htmlElm: HTMLElement;
	ehMap: EventHandlerMap;
}

export class Ctx
{
	private lastChildId: number | null;
	private childCtxs: Ctx[] | null;
	private parentCtx: Ctx | null;

	id: string;

	getParent()
	{
		return this.parentCtx;
	}
	getParentHtmlElmOwnerCtx(): CtxHtmlElementOwner
	{
		return <CtxHtmlElementOwner>this.findSelfOrParent(ctx => ctx instanceof CtxHtmlElementOwner);
	}
	getParentUpdatableCtx(): CtxUpdatable
	{
		return <CtxUpdatable>this.findSelfOrParent(ctx => ctx instanceof CtxUpdatable);
	}
	getParentRootCtx(): CtxRoot
	{
		return <CtxRoot>this.findSelfOrParent(ctx => ctx instanceof CtxRoot);
	}
	private findSelfOrParent(predicate: (ctx: Ctx) => boolean)
	{
		var ctx: Ctx | null = this;

		while (ctx != null)
		{
			if (predicate(ctx)) return ctx;

			ctx = ctx.parentCtx;
		}

		return null;
	}
	protected forEachChild(action: (ctx: Ctx) => void): void
	{
		if (this.childCtxs) this.childCtxs.forEach(ctx => action(ctx));
	}

	addChildCtx(ctx: Ctx): void
	{
		this.childCtxs = this.childCtxs || [];
		this.childCtxs.push(ctx);
		ctx.parentCtx = this;
	}
	protected removeChildren(): void
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
	protected unregisterEventHandlers(): void
	{
		var ctxRoot = this.getParentRootCtx();
		this.unregisterEventHandlersFromRoot(ctxRoot);
	}
	unregisterEventHandlersFromRoot(ctxRoot: CtxRoot): void
	{
		this.forEachChild(ctx => ctx.unregisterEventHandlersFromRoot(ctxRoot));
	}
	protected afterAttach(): void
	{
		this.forEachChild(ctx => ctx.afterAttach());
	}
	protected beforeDetach(): void
	{
		this.forEachChild(ctx => ctx.beforeDetach());
	}
	protected getHtmlElement(): HTMLElement
	{
		var ctxElm = this.getParentHtmlElmOwnerCtx();
		return ctxElm.getHtmlElement();
	}

	generateNextChildId(): string
	{
		this.lastChildId = (this.lastChildId || 0) + 1;
		return utils.appendDelimited(this.id, '-', this.lastChildId.toString());
	}
	protected resetNextChildId(): void
	{
		this.lastChildId = null;
	}

	protected _update(content: any): void
	{
		this.beforeDetach();

		this.detachPropKeys();

		this.unregisterEventHandlers();

		this.removeChildren();
		this.resetNextChildId();

		var htmlElement = this.getHtmlElement();
		if (htmlElement)
		{
			var innerHtml = CtxScope.use(this, () => this._renderHtml(content));
			this.setInnerHtml(htmlElement, innerHtml || '');
		}

		this.afterAttach();
	}
	protected _renderHtml(content: any): string | null
	{
		return null;
	}
	protected setInnerHtml(htmlElement: HTMLElement, innerHtml: string): void
	{

	}
	private detachPropKeys(): void
	{
		var ctxs: Ctx[] = [];
		this.collectChildContexts(ctxs);

		CtxUtils.removeCtxs(ctxs);
	}
	private collectChildContexts(ctxs: Ctx[]): void
	{
		ctxs.push(this);

		this.forEachChild(ctx => ctx.collectChildContexts(ctxs));
	}

	//protected getDbgArgs(): any[]
	//{
	//	return ['%o #%s', this, this.id];
	//}
	//log(fmt: string, ...args: any[]): void
	//{
	//	var dbgArgs = this.getDbgArgs();
	//	dbgArgs[0] = utils.appendDelimited(dbgArgs[0], ': ', fmt);
	//	dbgArgs = dbgArgs.concat(args);
	//	console.log.apply(console, dbgArgs);
	//}
}
export class CtxHtmlElementOwner extends Ctx
{
	getTagName(): string | null
	{
		return null;
	}
}
export class CtxElement extends CtxHtmlElementOwner
{
	private tagName: string;
	private refs: Ref[] | null;

	constructor(id: string, tagName: string, refs: Ref[] | null)
	{
		super();

		this.id = id;
		this.tagName = tagName;
		this.refs = refs;
	}
	getHtmlElement(): HTMLElement
	{
		var htmlElement = document.getElementById(this.id);
		if (!htmlElement) throw new Error(`Can not find element by id: ${this.id}`);

		return htmlElement;
	}
	getTagName(): string
	{
		return this.tagName;
	}

	unregisterEventHandlersFromRoot(ctxRoot: CtxRoot): void
	{
		ctxRoot.detachElmEventHandlers(this.id);

		super.unregisterEventHandlersFromRoot(ctxRoot);
	}
	removeChildren(): void
	{
		if (this.refs)
		{
			this.refs.forEach(r => r.set(null));
			this.refs = null;
		}

		super.removeChildren();
	}
	//getDbgArgs(): any[]
	//{
	//	var htmlElement = document.getElementById(this.id);
	//	return ['%o %s#%s %o', this, this.tagName, this.id, htmlElement];
	//}
}
export class CtxRoot extends CtxHtmlElementOwner
{
	private htmlElement: HTMLElement;
	private attachedEventNames: { [eventName: string]: boolean } | null;
	private eventHandlers: { [elmId: string]: EventHandlerMap } | null;

	getHtmlElement(): HTMLElement
	{
		return this.htmlElement;
	}
	render(content: any, htmlElement?: HTMLElement): void
	{
		if (htmlElement != null)
		{
			if (this.htmlElement && this.htmlElement !== htmlElement)
			{
				this._update(null);
			}

			this.htmlElement = htmlElement;
			this.id = htmlElement.id;
		}

		this._update(content);
	}
	protected _renderHtml(content: any): string | null
	{
		return RenderUtils.renderHtml(content);
	}
	protected setInnerHtml(htmlElement: HTMLElement, innerHtml: string): void
	{
		htmlElement.innerHTML = innerHtml;
	}

	protected unregisterEventHandlers(): void
	{
		var jqElm = jQuery(this.htmlElement);
		jqElm.off();
		this.attachedEventNames = null;
		this.eventHandlers = null;
	}
	attachElmEventHandlers(elmId: string, eventHandlers: EventHandlerMap): void
	{
		//console.group('attached events for: %s: %o', elmId, eventHandlers);

		this.eventHandlers = this.eventHandlers || {};
		this.eventHandlers[elmId] = eventHandlers;

		this.updateEventSubscriptions();

		//console.groupEnd();
	}
	detachElmEventHandlers(elmId: string): void
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
	private updateEventSubscriptions(): void
	{
		var jqElm = jQuery(this.htmlElement);

		var currentEventNames: { [eventName: string]: boolean } = {};
		var currentEventNamesCount = 0;

		if (this.eventHandlers)
		{
			let eventHandlers = this.eventHandlers; // remove null from the type

			objUtils.forEachKey(eventHandlers, elmId =>
			{
				var elmEventHandlers = eventHandlers[elmId];
				objUtils.forEachKey(elmEventHandlers, eventName =>
				{
					currentEventNames[eventName] = true;
					currentEventNamesCount++;
				});
			});
		}

		if (this.attachedEventNames)
		{
			objUtils.forEachKey(this.attachedEventNames, eventName =>
			{
				if (!(eventName in currentEventNames))
				{
					//console.log("unsubscribe from event: %s", eventName);
					jqElm.off(eventName);
				}
			});
		}

		objUtils.forEachKey(currentEventNames, eventName =>
		{
			if (!this.attachedEventNames || !(eventName in this.attachedEventNames))
			{
				//console.log("subscribe to event: %s", eventName);

				jqElm.on(eventName, e =>
				{
					//console.log('on event: %s on %o', e.type, e.target);
					this.handleEvent(e);
				});
			}
		});

		this.attachedEventNames = currentEventNamesCount == 0 ? null : currentEventNames;
	}
	private handleEvent(e: JQueryEventObject)
	{
		var htmlElm = <HTMLElement>e.target;
		var r = this.findEventHandlers(htmlElm);
		if (r)
		{
			var eventHandler = r.ehMap[e.type];
			if (eventHandler)
			{
				//console.log('on event: %o for: %o id: %s; %s', e.type, e.target, elmId, htmlElm.tagName);

				if (e.type == 'click' && r.htmlElm.tagName.toLowerCase() == 'a')
				{
					e.preventDefault();
				}

				eventHandler(e, r.htmlElm);
			}
		}
	}
	private findEventHandlers(htmlElement: HTMLElement): HtmlElementEvents | null
	{
		while (htmlElement && htmlElement != this.htmlElement)
		{
			var elmId = htmlElement.id;

			var elmEventHandlers = elmId && this.eventHandlers && this.eventHandlers[elmId];
			if (elmEventHandlers) return ({
				htmlElm: htmlElement,
				ehMap: elmEventHandlers,
			});

			htmlElement = htmlElement.parentElement;
		}

		return null;
	}
	//toString(): string // for DEBUG
	//{
	//	return "root";
	//}
	//getDbgArgs(): any[]
	//{
	//	return ['%o', this];
	//}
}
export class CtxUpdatable extends Ctx
{
	update(): void
	{
	}
}
export class CtxUpdatableChild extends CtxUpdatable
{
	content: any;

	constructor(id: string, content: any)
	{
		super();

		this.id = id;
		this.content = content;
	}
	update(): void
	{
		this._update(this.content);
	}
	protected _renderHtml(content: any)
	{
		return RenderUtils.getRenderedHtml(content);
	}
	protected setInnerHtml(htmlElement: HTMLElement, innerHtml: string): void
	{
		//console.log("CtxUpdatableChild.update: %o %s", htmlElement, this.id);

		RenderUtils.updateInnerHtml(htmlElement, this.id, innerHtml);
	}
	protected afterAttach(): void
	{
		var renderer = <Renderer>this.content;
		if (renderer.afterAttach) renderer.afterAttach();

		super.afterAttach();
	}
	protected beforeDetach(): void
	{
		super.beforeDetach();

		var renderer = <Renderer>this.content;
		if (renderer.beforeDetach) renderer.beforeDetach();
	}

	//toString(): string // for DEBUG
	//{
	//	return "block: " + this.id;
	//}
	//getDbgArgs(): any[]
	//{
	//	return ['%o #%s', this, this.id];
	//}
}
export class CtxUpdatableAttr extends CtxUpdatable
{
	attrName: string;
	renderFn: () => any;

	update(): void
	{
		var htmlElement = this.getHtmlElement();
		//console.log("%o update: %o %s", this, htmlElement, this.attrName);

		var v: string = CtxScope.use(this, () => this.renderFn());

		//console.log("%o update: %o %s = %o", this, htmlElement, this.attrName, v);

		var jqElement = jQuery(htmlElement);

		// attributes checked and value can be changed only by $.prop()

		if (this.attrName == 'checked')
		{
			jqElement.prop('checked', v != null);
		}
		else if (this.attrName == 'value')
		{
			jqElement.prop('value', v);
		}
		else
		{
			if (v == null)
				jqElement.removeAttr(this.attrName);
			else
				jqElement.attr(this.attrName, v);
		}
	}
	//toString(): string // for DEBUG
	//{
	//	var ctxElm = this.getParentHtmlElmOwnerCtx();
	//	return utils.format("attr: #${id}[${attrName}]",  {
	//		id: ctxElm.id,
	//		attrName: this.attrName,
	//	});
	//}
	//getDbgArgs(): any[]
	//{
	//	return ['%o #%s[%s]', this, this.id, this.attrName];
	//}
}
export class CtxUpdatableValue extends CtxUpdatable
{
	//tagName: string;
	propName: string;
	renderFn: () => any;

	update(): void
	{
		var htmlElement = this.getHtmlElement();

		var val = CtxScope.use(this, () => this.renderFn());
		//console.log("%o update: %o %s = %o", this, htmlElement, this.propName, val);

		var jqElement = jQuery(htmlElement);
		jqElement.prop(this.propName, val);
	}
	//		toString(): string // for DEBUG
	//		{
	//			var ctxElm = this.getParentHtmlElmOwnerCtx();
	//			return `value: #${ctxElm.id}[${this.propName}]`;
	//		}
	//		getDbgArgs(): any[]
	//		{
	//			return ['%o prop:[%s]', this, this.propName];
	//		}
}
export class CtxScope
{
	private static contexts: Ctx[] = [];

	static getCurrentSafe()
	{
		let ctx = this.getCurrent();
		if (ctx == null) throw new Error("No current context.");

		return ctx;
	}
	static getCurrent()
	{
		var contexts = this.contexts;
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
