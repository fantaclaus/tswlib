﻿/**
 * @internal
 */
namespace tsw.internal
{
	interface HtmlElementEvents
	{
		htmlElm: HTMLElement;
		ehMap: EventHandlerMap;
	}

	export abstract class Ctx
	{
		private lastChildId: number | null;
		private childCtxs: Ctx[] | null;
		private parentCtx: Ctx | null;

		public id: string;

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
			return this.findSelfOrParent<CtxRoot>(ctx => ctx instanceof CtxRoot);
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
		protected getHtmlElement(): HTMLElement | null
		{
			var ctxElm = this.getParentHtmlElmOwnerCtx();
			return ctxElm && ctxElm.getHtmlElement();
		}

		generateNextChildId()
		{
			this.lastChildId = (this.lastChildId || 0) + 1;
			return utils.appendDelimited(this.id, '-', this.lastChildId.toString());
		}
		protected resetNextChildId()
		{
			this.lastChildId = null;
		}

		protected _update(content: any)
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
		protected _renderHtml(content: any): string
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

			tsw.internal.removeCtxs(ctxs);
		}
		private collectChildContexts(ctxs: Ctx[])
		{
			ctxs.push(this);

			this.forEachChild(ctx => ctx.collectChildContexts(ctxs));
		}

		//protected getDbgArgs(): any[]
		//{
		//	return ['%o #%s', this, this.id];
		//}
		//log(fmt: string, ...args: any[])
		//{
		//	var dbgArgs = this.getDbgArgs();
		//	dbgArgs[0] = utils.appendDelimited(dbgArgs[0], ': ', fmt);
		//	dbgArgs = dbgArgs.concat(args);
		//	console.log.apply(console, dbgArgs);
		//}
	}
	export abstract class CtxHtmlElementOwner extends Ctx
	{
		abstract getTagName(): string;
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

		unregisterEventHandlersFromRoot(ctxRoot: CtxRoot)
		{
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

		getTagName()
		{
			return this.htmlElement.tagName;
		}
		getHtmlElement(): HTMLElement
		{
			return this.htmlElement;
		}
	    render(content: any, htmlElement: HTMLElement)
	    {
		    if (this.htmlElement !== htmlElement)
		    {
			    this._update(null);
		    }

		    this.htmlElement = htmlElement;
		    this.id = htmlElement.id;

		    this._update(content);
	    }
		protected _renderHtml(content: any)
		{
			return internal.renderHtml(content);
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
					// console.log('on event: %o for: %o id: %s; %s', e.type, e.target, htmlElm.id, htmlElm.tagName);

					if (e.type == 'click' && r.htmlElm.tagName.toLowerCase() == 'a')
					{
						e.preventDefault();
					}

					eventHandler(e, r.htmlElm);
				}
			}
		}
		private findEventHandlers(htmlElement: HTMLElement | null): HtmlElementEvents | null
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
	export abstract class CtxUpdatable extends Ctx
	{
		abstract update(): void;
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
		update()
		{
			this._update(this.content);
		}
		protected _renderHtml(content: any)
		{
			return internal.getRenderedHtml(content);
		}
		protected setInnerHtml(htmlElement: HTMLElement, innerHtml: string)
		{
			//console.log("CtxUpdatableChild.update: %o %s", htmlElement, this.id);

			internal.updateInnerHtml(htmlElement, this.id, innerHtml);
		}
		protected afterAttach()
		{
			var renderer = <Renderer>this.content;
			if (renderer.afterAttach) renderer.afterAttach();

			super.afterAttach();
		}
		protected beforeDetach()
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
		renderFn: () => string | null;

		update()
		{
			var htmlElement = this.getHtmlElement();
			if (!htmlElement) throw new Error("htmlElement is null");
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

		update()
		{
			var htmlElement = this.getHtmlElement();
			if (!htmlElement) throw new Error("htmlElement is null");

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
}
