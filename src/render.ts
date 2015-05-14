module tsw.render
{
	interface PropKeyContext
	{
		propKey: any;
		ctx: CtxUpdatable;
	}

	export class CtxUtils
	{
		private static propKeyToCtxMap: PropKeyContext[] = null;
		private static ctxUpdateQueue: CtxUpdatable[] = null;
		private static timerId: number = null;


		private static getCtx(): CtxUpdatable
		{
			var ctx = CtxScope.getCurrent();
			return ctx ? ctx.getParentUpdatableCtx() : null;
		}
		public static attach(propKey: any): void
		{
			var ctx = this.getCtx();
			if (ctx)
			{
				this.propKeyToCtxMap = this.propKeyToCtxMap || [];

				var exists = this.propKeyToCtxMap.some(p => p.propKey === propKey && p.ctx == ctx);
				if (!exists)
				{
					this.propKeyToCtxMap.push({ propKey: propKey, ctx: ctx });

					//console.log('attached:', propKey.toString(), this.propKeyToCtxMap && this.propKeyToCtxMap.map(p => p.propKey));
				}
			}
		}
		public static removeCtxs(ctxs: Ctx[]): void
		{
			if (this.propKeyToCtxMap)
			{
				//var removedKeys = this.propKeyToCtxMap
				//	.filter(p => utils.arrayUtils.contains(ctxs, p.ctx))
				//	.map(p => p.propKey);

				this.propKeyToCtxMap = this.propKeyToCtxMap.filter(p => !utils.arrayUtils.contains(ctxs, p.ctx));

				//console.log('removed: ', removedKeys, this.propKeyToCtxMap && this.propKeyToCtxMap.map(p => p.propKey));
			}
		}
		public static update(propKey: any): void
		{
			var propKeyContexts = this.propKeyToCtxMap && this.propKeyToCtxMap.filter(p => p.propKey === propKey);
			//console.log('update req: %o; found: %o', propKey, propKeyContexts);

			if (propKeyContexts == null || propKeyContexts.length == 0) return;

			var currentCtx = this.getCtx(); // context that has been set in event handler for 'change' or 'input' event

			// currentCtx is checked for optimization: don't update context whose value is just set by user action

			// add contexts to this.ctxUpdateQueue

			var newQueue = this.ctxUpdateQueue || [];

			propKeyContexts.forEach(p =>
			{
				if (p.ctx !== currentCtx && !utils.arrayUtils.contains(newQueue, p.ctx))
				{
					newQueue.push(p.ctx);
				}
			});

			if (newQueue.length > 0)
			{
				this.ctxUpdateQueue = newQueue;

				if (!this.timerId)
				{
					this.timerId = window.setTimeout(() => this.processQueue(), 0);
				}
			}
		}
		private static processQueue(): void
		{
			var contexts = this.ctxUpdateQueue;

			this.timerId = null;
			this.ctxUpdateQueue = null;

			if (contexts)
			{
				var contextsToUpdate = contexts.filter(ctx => !this.isAnyParentInList(ctx, contexts)); // do it before ctx.update(), since parents will be set to null

				contextsToUpdate.forEach(ctx =>
				{
					//console.group('update:', ctx, ctx.id);

					ctx.update();

					//console.groupEnd();
				});
			}
		}
		private static isAnyParentInList(ctx: Ctx, contexts: CtxUpdatable[]): boolean
		{
			if (!ctx) return false;

			while (true)
			{
				ctx = ctx.getParent();

				if (!ctx) return false;

				if (utils.arrayUtils.contains(contexts, ctx)) return true;
			}
		}
	}

	export class Ctx
	{
		private lastChildId: number;
		private childCtxs: Ctx[];
		private parentCtx: Ctx;

		id: string;

		getParent(): Ctx
		{
			return this.parentCtx;
		}
		getParentHtmlElmOwnerCtx(): CtxHtmlElementOwner
		{
			return <CtxHtmlElementOwner> this.findSelfOrParent(ctx => ctx instanceof CtxHtmlElementOwner);
		}
		getParentUpdatableCtx(): CtxUpdatable
		{
			return <CtxUpdatable> this.findSelfOrParent(ctx => ctx instanceof CtxUpdatable);
		}
		getParentRootCtx(): CtxRoot
		{
			return <CtxRoot> this.findSelfOrParent(ctx => ctx instanceof CtxRoot);
		}
		private findSelfOrParent(predicate: (ctx: Ctx) => boolean): Ctx
		{
			var ctx = this;

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
			return tsw.utils.appendDelimited(this.id, '-', this.lastChildId.toString());
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
				this.setInnerHtml(htmlElement, utils.toStringSafe(innerHtml));
			}

			this.afterAttach();
		}
		protected _renderHtml(content: any): string
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
		getTagName(): string
		{
			return null;
		}
	}

	export class CtxElement extends CtxHtmlElementOwner
	{
		private tagName: string;
		private refs: tsw.elements.Ref[];

		constructor(id: string, tagName: string, refs: tsw.elements.Ref[])
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
		private attachedEventNames: { [eventName: string]: boolean };
		private eventHandlers: { [elmId: string]: tsw.common.JQueryEventHandlerMap };

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
		protected _renderHtml(content: any): string
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
		attachElmEventHandlers(elmId: string, eventHandlers: tsw.common.JQueryEventHandlerMap): void
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
				utils.objUtils.forEachKey(this.eventHandlers, elmId =>
				{
					var elmEventHandlers = this.eventHandlers[elmId];
					utils.objUtils.forEachKey(elmEventHandlers, eventName =>
					{
						currentEventNames[eventName] = true;
						currentEventNamesCount++;
					});
				});
			}

			if (this.attachedEventNames)
			{
				utils.objUtils.forEachKey(this.attachedEventNames, eventName =>
				{
					if (!(eventName in currentEventNames))
					{
						//console.log("unsubscribe from event: %s", eventName);
						jqElm.off(eventName);
					}
				});
			}

			utils.objUtils.forEachKey(currentEventNames, eventName =>
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
			var htmlElm = <HTMLElement> e.target;
			var r = this.findEventHandlers(htmlElm);
			if (r)
			{
				var eventHandler = r.ehMap[e.type];
				if (eventHandler)
				{
					//console.log('on event: %o for: %o id: %s; %s', e.type, e.target, elmId, htmlElm.tagName);

					if (e.type == 'click' && r.htmlElm.tagName.toLowerCase() == 'a') //  && jQuery(htmlElm).attr('href') == "#"
					{
						e.preventDefault();
					}

					eventHandler(e, r.htmlElm);
				}
			}
		}

		protected findEventHandlers(htmlElement: HTMLElement): { htmlElm: HTMLElement; ehMap: tsw.common.JQueryEventHandlerMap }
		{
			while (htmlElement && htmlElement != this.htmlElement)
			{
				var elmId = htmlElement.id;

				var elmEventHandlers = elmId && this.eventHandlers[elmId];
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

	class CtxUpdatableChild extends CtxUpdatable
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
		protected _renderHtml(content: any): string
		{
			return RenderUtils.getRenderedHtml(content);
		}
		protected setInnerHtml(htmlElement: HTMLElement, innerHtml: string): void
		{
			//console.log("CtxUpdatableChild.update: %o %s", htmlElement, this.id);

			var markers = new HtmlBlockMarkers(this.id);
			DOMUtils.updateDOM(htmlElement, innerHtml, markers);
		}
		protected afterAttach(): void
		{
			var renderer = <tsw.common.Renderer> this.content;
			if (renderer.afterAttach) renderer.afterAttach();

			super.afterAttach();
		}
		protected beforeDetach(): void
		{
			super.beforeDetach();

			var renderer = <tsw.common.Renderer> this.content;
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

	class CtxUpdatableAttr extends CtxUpdatable
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

	class CtxUpdatableValue extends CtxUpdatable
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

		static getCurrent(): Ctx
		{
			var contexts = this.contexts;
			return contexts.length == 0 ? null : contexts[contexts.length - 1];
		}

		static use<T>(ctx: Ctx, action: () => T)
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

	interface MapStringToArray
	{
		[name: string]: any[];
	}

	class RenderUtils
	{
		public static renderHtml(content: any): string
		{
			var items: any[] = [];
			this.addExpanded(items, content);

			return tsw.utils.join(items, null, item => this.renderItem(item));
		}
		private static renderItem(item: any): string
		{
			if (item === true || item === false) return '';

			if (item instanceof tsw.common.rawHtml) return (<tsw.common.rawHtml> item).value;

			if (item instanceof tsw.elements.elm) return this.renderElement(<tsw.elements.elm> item);

			// content of textarea can not be updated using comment blocks, since they are displayed inside textarea as is
 			var ctxCurrent = CtxScope.getCurrent();
			var ctxElm = ctxCurrent.getParentHtmlElmOwnerCtx();
			var tagName = ctxElm ? ctxElm.getTagName() : null;

			//console.log('ctxElm: ', ctxElm);
			if (tagName != 'textarea')
			{
				var canBeUpdated = this.canBeUpdated(item);
				if (canBeUpdated) return this.renderUpdatableChild(item);
			}

			var s = item.toString();
			return tsw.utils.htmlEncode(s);
		}
		private static renderUpdatableChild(item: any): string
		{
			var ctxCurrent = CtxScope.getCurrent();

			var id = ctxCurrent.generateNextChildId();

			var ctx = new CtxUpdatableChild(id, item);
			ctxCurrent.addChildCtx(ctx);

			//console.log('getElmCtx: %o', ctx.getElmCtx());

			var innerHtml = CtxScope.use(ctx, () => this.getRenderedHtml(item));

			var markers = new HtmlBlockMarkers(ctx.id);
			return markers.getHtml(innerHtml);
		}
		private static renderElement(elm: tsw.elements.elm): string
		{
			var tagName = elm.z_getTagName();
			//console.log(elm, tagName);

			if (!tagName)
			{
				var children = elm.z_getChildren();
				//console.log('children: ', children);

				return this.renderHtml(children);
			}

			var attrs = this.getElmAttrs(elm); // attr names in lower case
			//console.log('attrs: ', attrs);

			var elmRefs = elm.z_getRefs();

			var ctxCurrent = CtxScope.getCurrent();

			var attrId = this.getRenderedAttrValues(attrs['id']);
			delete attrs['id'];

			var id = attrId || ctxCurrent.generateNextChildId();
			//console.log('id: ', id);

			var ctx = new CtxElement(id, tagName, elmRefs);
			ctxCurrent.addChildCtx(ctx);

			//this.logElmAttrs(elm);

			//var elmPropDef = this.getValuePropDef(elm);
			var elmWithVal = this.asElmWithValue(elm);
			var propDef = elmWithVal && elmWithVal.z_getPropDef();

			var useVal = propDef && propDef.get instanceof Function;
			var updateVal = useVal && propDef.set instanceof Function;

			var valData: { value: any; ctx: CtxUpdatable; valPropName: string; } = null;
			if (useVal)
			{
				var valAttrName = elmWithVal.z_getValueAttrName();
				var valPropName = elmWithVal.z_getValuePropName();

				var valueData = CtxScope.use(ctx, () => this.getValue(propDef, valPropName));

				// replace attributes with value of propdef (checked or value)

				if (valAttrName != null && valueData.value != null) // tagName == 'input'
				{
					//delete attrs['checked'];
					//delete attrs['value'];

					attrs[valAttrName] = [ valueData.value ];
				}

				valData = { value: valueData.value, ctx: valueData.ctx, valPropName:  valPropName };
			}

			var attrsHtml = CtxScope.use(ctx, () => this.getElmAttrHtml(attrs));
			//console.log('attrsHtml: [%s]', attrsHtml);

			var innerHtml: string;

			if (useVal && tagName == 'textarea')
			{
				innerHtml = valData.value == null ? '' : utils.htmlEncode(valData.value);
			}
			else
			{
				var children = elm.z_getChildren();
				innerHtml = CtxScope.use(ctx, () => this.renderHtml(children));
			}

			var eventHanders = elm.z_getEventHandlers();

			if (updateVal)
			{
				eventHanders = eventHanders || {};

				var savedHandlers: tsw.common.JQueryEventHandlerMap = {};
				savedHandlers['change'] = eventHanders['change'];
				savedHandlers['input'] = eventHanders['input'];

				var handler = (e: JQueryEventObject, htmlElement: HTMLElement) =>
				{
					var v = $(htmlElement).prop(valData.valPropName);

					// pass ctx to CtxUtils.update for optimization: to skip it during update.
					CtxScope.use(valData.ctx, () =>
					{
						propDef.set(v);
					});

					var userHandler = savedHandlers[e.type];
					if (userHandler) userHandler(e, htmlElement);
				};

				eventHanders['change'] = handler;
				eventHanders['input'] = handler;
			}

			if (eventHanders)
			{
				var ctxRoot = ctxCurrent.getParentRootCtx();
				ctxRoot.attachElmEventHandlers(ctx.id, eventHanders);
			}

			if (elmRefs)
			{
				elmRefs.forEach(r =>
				{
					r.set(id);
				});
			}

			var htmlStartTag = '<' + tagName;

			var isCtxUsed = ctx.hasChildren() || eventHanders != null || elmRefs != null;
			if (isCtxUsed) htmlStartTag = tsw.utils.appendDelimited(htmlStartTag, ' ', 'id=' + this.quoteAttrVal(id));

			htmlStartTag = tsw.utils.appendDelimited(htmlStartTag, ' ', attrsHtml);
			htmlStartTag += '>';

			var html: string;

			html = htmlStartTag;

			if (innerHtml) html += innerHtml;

			if (innerHtml || this.elmNeedsCloseTag(tagName))
			{
				html += '</' + tagName + '>';
			}

			return html;
		}

		//private static logElmAttrs(elm)
		//{
		//	var elmAttrs = elm.z_getAttrs();
		//	var ss = elmAttrs.reduce((s, ea) =>
		//	{
		//		return tsw.utils.appendDelimited(s, ', ', utils.format('{${name}=${value}}', ea));
		//	}, '');
		//	console.log('attrs: ', ss);
		//}

		private static elmNeedsCloseTag(tagName: string):boolean
		{
			var tagNameUpper = tagName.toUpperCase();

			var needNoClosingTag = tagNameUpper == "IMG" || tagNameUpper == "INPUT" || tagNameUpper == "BR" ||
				tagNameUpper == "HR" || tagNameUpper == "BASE" || tagNameUpper == "COL" ||
				tagNameUpper == "COLGROUP" || tagNameUpper == "KEYGEN" || tagNameUpper == "META" || tagNameUpper == "WBR";

			return !needNoClosingTag;
		}
		private static getElmAttrHtml(attrs: MapStringToArray): string
		{
			var attrsHtml = Object.keys(attrs)
				.map(attrName => ({
					attrName: attrName,
					attrVal: this.getAttrVal(attrs, attrName)
				}))
				.filter(a => a.attrVal !== null)
				.reduce((attrsHtml, a) =>
				{
					var attrHtml = a.attrName;
					if (a.attrVal) attrHtml += '=' + this.quoteAttrVal(a.attrVal);

					return tsw.utils.appendDelimited(attrsHtml, ' ', attrHtml);
				},
				'');

			return attrsHtml;
		}
		private static getAttrVal(attrs: MapStringToArray, attrName: string): string
		{
			var attrVals: any[] = attrs[attrName];
			//console.log('attrName: %s; attrVals: %o', attrName, attrVals);

			var canBeUpdated: boolean;
			var fn: () => any;

			if (attrName == 'class')
			{
				canBeUpdated = attrVals.some(av => this.canBeUpdatedAttr(av));
				fn = () => tsw.utils.join(attrVals, ' ', av => this.getRenderedAttrValue(av));
			}
			else if (attrName == 'style')
			{
				canBeUpdated = attrVals.some(av => this.canBeUpdatedStyle(av));
				fn = () => tsw.utils.join(attrVals, '; ', av => this.getRenderedStyleValue(av));
			}
			else
			{
				canBeUpdated = attrVals.some(av => this.canBeUpdatedAttr(av));
				fn = () => this.getRenderedAttrValues(attrVals);
			}

			if (canBeUpdated)
			{
				var ctxCurrent = CtxScope.getCurrent();

				var ctx = new CtxUpdatableAttr();
				ctxCurrent.addChildCtx(ctx);
				ctx.attrName = attrName;
				ctx.renderFn = fn;

				return CtxScope.use(ctx, fn);
			}
			else
			{
				return fn();
			}
		}
		protected static getRenderedAttrValues(attrVals: any[]): string
		{
			return tsw.utils.join(attrVals, ', ', av => this.getRenderedAttrValue(av));
		}
		private static getElmAttrs(elm: tsw.elements.elm): MapStringToArray
		{
			var attrs: MapStringToArray = {};

			var elmAttrs = elm.z_getAttrs();
			if (elmAttrs)
			{
				elmAttrs.forEach(a =>
				{
					if (a.value != null)
					{
						var attrName = a.name;
						var vals: any[] = attrs[attrName];
						if (!vals)
						{
							vals = [];
							attrs[attrName] = vals;
						}

						vals.push(a.value);
					}
				});
			}

			return attrs;
		}
		private static quoteAttrVal(s: string): string
		{
			var encoded = '';

			for (var i = 0; i < s.length; i++)
			{
				var ch = s.charAt(i);
				var cc = s.charCodeAt(i);

				var ch2: string;

				if (cc < 32 || ch == '"' || ch == "'")
				{
					ch2 = '&#x' + cc.toString(16) + ';';
				}
				else
				{
					ch2 = ch;
				}

				encoded += ch2;
			}

			return '"' + encoded + '"';
		}

		private static canBeUpdated(item: any): boolean
		{
			if (item instanceof Function) return true;
			if (item.render instanceof Function) return true; // macro element
			if (item.get instanceof Function) return true; // PropVal

			return false;
		}
		public static getRenderedHtml(item: any): string
		{
			var content = this.getRenderedContent(item);
			return this.renderHtml(content);
		}
		private static getRenderedContent(item: any): any
		{
			if (item instanceof Function) return item();
			if (item.render instanceof Function) return item.render();
			if (item.get instanceof Function) return item.get();

			return item;
		}
		private static getRenderedAttrValue(item: any): any
		{
			var v = this.getRenderedAttrValueRaw(item);
			if (v === true) return '';
			if (v === false) return null;
			return v;
		}
		private static canBeUpdatedAttr(item: any): boolean
		{
			if (item instanceof Function) return true;
			if (item.get instanceof Function) return true; // PropVal
			return false;
		}
		private static getRenderedAttrValueRaw(item: any): any
		{
			if (item instanceof Function) return item();
			if (item.get instanceof Function) return item.get();

			return item;
		}
		private static canBeUpdatedStyle(item: tsw.elements.attrValType | tsw.elements.StyleRule): boolean
		{
			if (typeof item === "object" && item instanceof tsw.elements.StyleRule)
			{
				return this.canBeUpdatedAttr(item.propValue);	
			}
			else
			{
				return this.canBeUpdatedAttr(item);
			}	
		}
		private static getRenderedStyleValue(item: tsw.elements.attrValType | tsw.elements.StyleRule): any
		{
			if (typeof item === "object" && item instanceof tsw.elements.StyleRule)
			{
				var v = this.getRenderedAttrValue(item.propValue);

				if (v == null || v == '') return null;

				return item.propName + ": " + v;
			}
			else
			{
				return this.getRenderedAttrValue(item);
			}	
		}
		private static asElmWithValue(elm: tsw.elements.elm): tsw.elements.elmWithValue
		{
			if (elm instanceof tsw.elements.elmWithValue)
			{
				return elm;
			}
			else
			{
				return null;
			}
		}
		private static getValue(propDef: tsw.props.PropDefReadable<any>, valPropName: string): { value: any; ctx: CtxUpdatable }
		{
			var ctxCurrent = CtxScope.getCurrent();

			var ctx = new CtxUpdatableValue();
			ctxCurrent.addChildCtx(ctx);
			//ctx.tagName = tagName;
			ctx.propName = valPropName;
			ctx.renderFn = () => propDef.get();

			var val = CtxScope.use(ctx, ctx.renderFn);

			return { value: val, ctx: ctx };
		}

		private static addExpanded(target: any[], v: any): void
		{
			if (v == null) return;

			if (v instanceof Array)
			{
				for (var i = 0; i < v.length; i++)
				{
					this.addExpanded(target, v[i]);
				}
			}
			else
			{
				target.push(v);
			}
		}
	}

	class HtmlBlockMarkers
	{
		begin: string;
		end: string;

		constructor(id: string)
		{
			this.begin = "BEGIN:" + id;
			this.end = "END:" + id;
		}
		getHtml(innerHtml: string)
		{
			return "<!--" + this.begin + "-->" + utils.toStringSafe(innerHtml) + "<!--" + this.end + "-->";
		}
	}

	class DOMUtils
	{
		private static tmpHtmlElement: HTMLElement;

		static updateDOM(targetElement: HTMLElement, html: string, markers: HtmlBlockMarkers)
		{
			// TODO: remove native event handlers

			// TBODY must be defined explicitly in onRender() of a control
			// otherwise commented section will not be found, since targetElement would be TABLE

			var COMMENT_NODE = 8; // on IE8 Node is undefined

			var nodeBeginMarker: Node = null;
			var nodeEndMarker: Node = null;
			var isFirst = false;
			var isLast = false;

			if (targetElement.hasChildNodes())
			{
				var firstNode = targetElement.firstChild;
				if (firstNode.nodeType == COMMENT_NODE && firstNode.nodeValue == markers.begin)
				{
					nodeBeginMarker = firstNode;
					isFirst = true;
				}

				var lastNode = targetElement.lastChild;
				if (lastNode.nodeType == COMMENT_NODE && lastNode.nodeValue == markers.end)
				{
					nodeEndMarker = lastNode;
					isLast = true;
				}

				if (!(isFirst && isLast))
				{
					var node = firstNode;

					while (node)
					{
						if (node.nodeType == COMMENT_NODE)
						{
							if (node.nodeValue == markers.begin)
							{
								nodeBeginMarker = node;
							}
							else if (node.nodeValue == markers.end)
							{
								nodeEndMarker = node;
							}
						}

						node = node.nextSibling;
					}

					if (!nodeBeginMarker && nodeEndMarker)
					{
						// IE 8 removes all comments in the beginning of innerHTML
						nodeBeginMarker = firstNode;
						isFirst = true;
					}
				}
			}

			if ((isFirst && isLast) || (!nodeBeginMarker && !nodeEndMarker))
			{
//				utils.log('html: replace complete');
				targetElement.innerHTML = markers.getHtml(html);
			}
			else
			{
//				utils.log('html: replace between markers');

				// replace between markers

				if (nodeBeginMarker && nodeEndMarker)
				{
					var node = nodeBeginMarker.nextSibling;

					while (node !== nodeEndMarker)
					{
						var nodeNext = node.nextSibling;

						targetElement.removeChild(node);

						node = nodeNext;
					}

					var tmpHtmlElement = this.tmpHtmlElement;
					if (!tmpHtmlElement)
					{
						tmpHtmlElement = document.createElement('span');
						this.tmpHtmlElement = tmpHtmlElement; // cache it
					}

					// insert html into TABLE doesn't work on IE<10
					targetElement.insertBefore(tmpHtmlElement, nodeEndMarker);
					tmpHtmlElement.insertAdjacentHTML('beforeBegin', html);
					targetElement.removeChild(tmpHtmlElement);

					// doesn't work on IE
//					var tmp = document.createElement('template');
//					tmp.innerHTML = html;
//					targetElement.insertBefore(tmp.content, nodeEndMarker);

				}
			}
		}
	}
}
