module tsw.render
{
	export class Ctx
	{
		private lastChildId: number;
		private childCtxs: Ctx[];
		private parentCtx: Ctx;

		id: string;

		getElmCtx(): CtxElement
		{
			var ctx = this;

			while (ctx != null)
			{
				if (ctx instanceof CtxElement) return <CtxElement> ctx;

				ctx = ctx.parentCtx;
			}

			return null;
		}

		addChildCtx(ctx: Ctx): void
		{
			this.childCtxs = this.childCtxs || [];
			this.childCtxs.push(ctx);
			ctx.parentCtx = this;
		}
		removeChildren(): void
		{
			if (this.childCtxs)
			{
				this.childCtxs.forEach(ctx =>
				{
					ctx.parentCtx = null;
				});

				this.childCtxs = null;
			}
		}
		log(): void
		{
			if (this.childCtxs)
			{
				console.group('id: %s %o', this.id, this);

				this.childCtxs.forEach(ctx =>
				{
					ctx.log();
				});

				console.groupEnd();
			}
			else
			{
				console.log('id: %s %o', this.id, this);
			}
		}
		public getUpdatableContexts(): CtxUpdatable[]
		{
			var list: CtxUpdatable[] = [];
			tsw.render.Ctx.collectUpdatableCtxs(list, this);
			return list;
		}
		static collectUpdatableCtxs(list: CtxUpdatable[], ctx: Ctx): void
		{
			if (ctx instanceof CtxUpdatable) list.push(<CtxUpdatable> ctx);

			if (ctx.childCtxs)
			{
				ctx.childCtxs.forEach(ctx2 =>
				{
					this.collectUpdatableCtxs(list, ctx2);
				});
			}
		}

		generateNextChildId(): string
		{
			this.lastChildId = (this.lastChildId || 0) + 1;
			return tsw.utils.appendDelimited(this.id, '-', this.lastChildId.toString());
		}
		resetNextChildId(): void
		{
			this.lastChildId = null;
		}
	}

	class CtxElement extends Ctx
	{
		tagName: string;

		getHtmlElement(): HTMLElement
		{
			var htmlElement = document.getElementById(this.id);
			if (!htmlElement) throw new Error(utils.format("Can not find element by id: ${id}", { id: this.id }));

			return htmlElement;
		}
	}

	export class CtxRoot extends CtxElement
	{
		private htmlElement: HTMLElement;

		getHtmlElement(): HTMLElement
		{
			return this.htmlElement;
		}
		setHtmlElement(htmlElement: HTMLElement): void
		{
			this.htmlElement = htmlElement;
			this.id = htmlElement.id;
		}
		render(content: any): void
		{
			var htm = this.generateHtml(content);
			console.log('html: [%s]', htm);

			this.htmlElement.innerHTML = htm;

			// TODO:  register and attach event handlers
			// TODO: call afterInsert
		}
		generateHtml(content: any): string // DEBUG
		{
			return CtxScope.use(this, () => RenderUtils.renderHtml(content));
		}
		toString(): string // for DEBUG
		{
			return "root";
		}
	}

	export class CtxUpdatable extends Ctx
	{
		// TODO: extract getting value into connon method
		// TODO: move to this class: renderFn: () => any;

		update(): void
		{
		}
	}

	class CtxUpdatableChild extends CtxUpdatable
	{
		content: any;

		update(): void
		{
			var ctxElm = this.getElmCtx();
			var htmlElement = ctxElm.getHtmlElement();
			//console.log("CtxUpdatableChild.update: %o %s", htmlElement, this.id);

			this.resetNextChildId();

			// TODO: call beforeRemove

			this.removeChildren();

			// TODO: events cleanup
			// TODO: databinding cleanup

			var innerHtml = CtxScope.use(this, () => RenderUtils.getRenderedHtml(this.content));

			var markers = new HtmlBlockMarkers(this.id);
			DOMUtils.updateDOM(innerHtml, htmlElement, markers);

			// TODO:  register event handlers
			// TODO: call afterInsert
		}
		toString(): string // for DEBUG
		{
			return "block: " + this.id;
		}
	}
	class CtxUpdatableAttr extends CtxUpdatable
	{
		attrName: string;
		renderFn: () => any;

		update(): void
		{
			var ctxElm = this.getElmCtx();
			var htmlElement = ctxElm.getHtmlElement();
			//console.log("%o update: %o %s", this, htmlElement, this.attrName);

			this.removeChildren();

			var v: string = CtxScope.use(this, () => this.renderFn());

			//console.log("%o update: %o %s = %o", this, htmlElement, this.attrName, v);

			var jqElement = jQuery(htmlElement);

			if (this.attrName == 'checked')
			{
				jqElement.prop(this.attrName, v != null);
			}
			else if (this.attrName == 'value')
			{
				jqElement.prop(this.attrName, v);
			}
			else
			{
				if (v == null)
					jqElement.removeAttr(this.attrName);
				else
					jqElement.attr(this.attrName, v);
			}
		}
		toString(): string // for DEBUG
		{
			var elmCtx = this.getElmCtx();
			return utils.format("attr: #${id}[${attrName}]",  {
				id: elmCtx.id,
				attrName: this.attrName,
			});
		}
	}
	class CtxUpdatableValue extends CtxUpdatable
	{
		tagName: string;
		propName: string;
		renderFn: () => any;

		update(): void
		{
			var ctxElm = this.getElmCtx();
			var htmlElement = ctxElm.getHtmlElement();

			this.removeChildren();

			var val = CtxScope.use(this, () => this.renderFn());
			console.log("%o update: %o %s = %o", this, htmlElement, this.propName, val);

			//console.log("%o update: %o %s = %o", this, htmlElement, this.attrName, v);

			var jqElement = jQuery(htmlElement);

			if (this.tagName == 'textarea')
			{
				jqElement.val(val);
			}
			else
			{
				if (this.propName == 'checked')
				{
					jqElement.prop(this.propName, val);
				}
				else if (this.propName == 'value')
				{
					jqElement.val(val);
				}
			}
		}
		toString(): string // for DEBUG
		{
			var elmCtx = this.getElmCtx();
			return utils.format("value: ${tagName}#${id}[${propName}]",  {
				tagName: this.tagName,
				id: elmCtx.id,
				propName: this.propName,
			});
		}
	}

	export class CtxScope
	{
		private static contexts: Ctx[] = [];

		static getCurrent(): Ctx
		{
			var contexts = this.contexts;
			return contexts.length == 0 ? null : contexts[contexts.length - 1];
		}
		//static getCurrentUpdatable(): CtxUpdatable
		//{
		//	var ctx = this.getCurrent();
		//	return ctx instanceof CtxUpdatable ? <CtxUpdatable> ctx : null;
		//}

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

			var htm = tsw.utils.join(items, null, item => this.renderItem(item));
			return htm;
		}
		private static renderItem(item: any): string
		{
			if (typeof item == 'boolean') return '';

			if (item instanceof tsw.common.rawHtml) return (<tsw.common.rawHtml> item).value;

			if (item instanceof tsw.elements.elm) return this.renderElement(<tsw.elements.elm> item);

			// content of textarea can not be updated using comment blocks, since they are displayed inside textarea as is

			var ctxParent = CtxScope.getCurrent();
			var ctxElm = ctxParent.getElmCtx();
			//console.log('ctxElm: ', ctxElm);
			if (ctxElm.tagName != 'textarea')
			{
				var canBeUpdated = this.canBeUpdated(item);
				if (canBeUpdated) return this.renderUpdatableChild(item);
			}

			var s = item.toString();
			return tsw.utils.htmlEncode(s);
		}
		private static renderUpdatableChild(item: any): string
		{
			var ctxParent = CtxScope.getCurrent();

			var ctx = new CtxUpdatableChild();
			ctxParent.addChildCtx(ctx);
			ctx.content = item;
			ctx.id = ctxParent.generateNextChildId();

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

				var innerHtml = this.renderHtml(children);
				return innerHtml;
			}

			var ctxParent = CtxScope.getCurrent();

			var ctx = new CtxElement();
			ctxParent.addChildCtx(ctx);
			ctx.id = ctxParent.generateNextChildId();
			ctx.tagName = tagName;
			elm.z_setId(ctx.id);

			//this.logElmAttrs(elm);

			var attrs = this.getElmAttrs(elm); // attr names in lower case
			//console.log('attrs: ', attrs);

			var propDef = this.getValuePropDef(elm);
			var val: any;
			var valAttrName: string = null;
			var valPropName: string = null;

			var useVal = propDef && propDef.get instanceof Function;

			if (useVal)
			{
				if (tagName == 'input')
				{
					var inputType = attrs['type'][0];
					if (inputType == 'checkbox' || inputType == 'radio')
					{
						valAttrName = 'checked';
						valPropName = 'checked';
					}
					else
					{
						valAttrName = 'value';
						valPropName = 'value';
					}
				}
				// TODO: if (tagName == 'select')

				val = CtxScope.use(ctx, () => this.getValue(propDef, tagName, valPropName));
			}

			// remove attributes overriden by value propdef (checked or value)
			if (useVal)
			{
				if (tagName == 'input')
				{
					delete attrs['checked'];
					delete attrs['value'];

					attrs[valAttrName] = [ val ];
				}
			}

			var attrsHtml = CtxScope.use(ctx, () => this.getElmAttrHtml(attrs));
			//console.log('attrsHtml: [%s]', attrsHtml);

			var html = '<' + tagName;
			html = tsw.utils.appendDelimited(html, ' ', attrsHtml);
			html += '>';

			var innerHtml: string = null;

			if (useVal && tagName == 'textarea')
			{
				innerHtml = utils.htmlEncode(val);
			}
			else
			{
				var children = elm.z_getChildren();
				innerHtml = CtxScope.use(ctx, () => this.renderHtml(children));
			}

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
				fn = () => tsw.utils.join(attrVals, ', ', av => this.getRenderedAttrValue(av));
			}

			if (canBeUpdated)
			{
				var ctxParent = CtxScope.getCurrent();

				var ctx = new CtxUpdatableAttr();
				ctxParent.addChildCtx(ctx);
				ctx.attrName = attrName;
				ctx.renderFn = fn;

				var attrVal = CtxScope.use(ctx, fn);
				return attrVal;
			}
			else
			{
				return fn();
			}
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
			if (item.render instanceof Function) return true;

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
			return false;
		}
		private static getRenderedAttrValueRaw(item: any): any
		{
			if (item instanceof Function) return item();

			return item;
		}
		private static canBeUpdatedStyle(item: any): boolean
		{
			if (!item.name) return this.canBeUpdatedAttr(item);

			return this.canBeUpdatedAttr(item.value);
		}
		private static getRenderedStyleValue(item: any): any
		{
			if (!item.name) return this.getRenderedAttrValue(item);

			var v1 = this.getRenderedAttrValue(item.value);
			if (v1 != null && v1 !== '') return item.name + ": " + v1;
			return '';
		}
		private static getValuePropDef(elm: tsw.elements.elm): tsw.common.PropDef<any>
		{
			if (elm instanceof tsw.elements.elmWithValue)
			{
				var elmV = <tsw.elements.elmWithValue> elm;
				return elmV.z_getValuePropDef();
			}

			return null;
		}
		private static getValue(propDef: tsw.common.PropDef<any>, tagName: string, valPropName: string): any
		{
			var ctxParent = CtxScope.getCurrent();

			var ctx = new CtxUpdatableValue();
			ctxParent.addChildCtx(ctx);
			ctx.tagName = tagName;
			ctx.propName = valPropName;
			ctx.renderFn = () => propDef.get();

			return CtxScope.use(ctx, ctx.renderFn);
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
			var s = innerHtml || ''; // to avoid: "" + null == "null"
			return "<!--" + this.begin + "-->" + s + "<!--" + this.end + "-->";
		}
	}

	class DOMUtils
	{
		private static tmpDiv: HTMLElement;

		static updateDOM(html: string, targetElement: HTMLElement, markers: HtmlBlockMarkers)
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

					var tmpDiv = this.tmpDiv;
					if (!tmpDiv)
					{
						tmpDiv = document.createElement('div');
						this.tmpDiv = tmpDiv; // cache it
					}

					// insert html into TABLE doesn't work on IE<10
					targetElement.insertBefore(tmpDiv, nodeEndMarker);
					tmpDiv.insertAdjacentHTML('beforeBegin', html);
					targetElement.removeChild(tmpDiv);

					// doesn't work on IE
//					var tmp = document.createElement('template');
//					tmp.innerHTML = html;
//					targetElement.insertBefore(tmp.content, nodeEndMarker);

				}
			}
		}
	}
}
