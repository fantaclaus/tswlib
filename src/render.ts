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
		getHtmlElement(): HTMLElement
		{
			return document.getElementById(this.id);
		}
	}

	export class CtxUpdatable extends Ctx
	{
		renderer: tsw.common.Renderer;

		update(): void
		{
		}
	}

	export class CtxRoot extends CtxElement
	{
		private htmlElement: HTMLElement;

		getHtmlElement(): HTMLElement
		{
			return this.htmlElement;
		}
		render(htmlElement: HTMLElement, content: any): void
		{
			this.htmlElement = htmlElement;
			this.id = htmlElement.id;

			var htm = CtxScope.use(this, () => RenderUtils.renderHtml(content));
			console.log('html: [%s]', htm);

			this.htmlElement.innerHTML = htm;
		}
		toString(): string // for DEBUG
		{
			return "root";
		}
	}

	class CtxUpdatableChild extends CtxUpdatable
	{
		update(): void
		{
			var htmlElement = this.getElmCtx().getHtmlElement();
			//console.log("CtxUpdatableChild.update: %o %s", htmlElement, this.id);

			this.resetNextChildId();

			this.removeChildren();

			// TODO: events cleanup
			// TODO: databinding cleanup

			var innerHtml = CtxScope.use(this, () =>
			{
				var content = this.renderer.render();
				return RenderUtils.renderHtml(content);
			});

			var markers = new HtmlBlockMarkers(this.id);
			DOMUtils.updateDOM(innerHtml, htmlElement, markers);
		}
		toString(): string // for DEBUG
		{
			return "block " + this.id;
		}
	}
	class CtxUpdatableAttr extends CtxUpdatable
	{
		attrName: string;

		update(): void
		{
			var htmlElement = this.getElmCtx().getHtmlElement();
			//console.log("%o update: %o %s", this, htmlElement, this.attrName);

			this.removeChildren();

			var v: string = CtxScope.use(this, () => this.renderer.render());

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
			var htmlElement = this.getElmCtx().getHtmlElement();
			return "#" + htmlElement.id + "[" + this.attrName + "]";
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

	class RenderUtils
	{
		public static renderHtml(content: any): string
		{
			var items: any[] = [];
			RenderUtils.addExpanded(items, content);

			var htm = tsw.utils.join(items, null, item => RenderUtils.renderItem(item));
			return htm;
		}
		private static renderItem(item: any): string
		{
			if (typeof item == 'boolean') return '';

			if (item instanceof tsw.common.rawHtml) return (<tsw.common.rawHtml> item).value;

			if (item instanceof tsw.elements.elm) return this.renderElement(<tsw.elements.elm> item);

			var renderer = this.getRenderer(item);
			if (renderer) return this.renderUpdatableChild(renderer);

			var s = item.toString();
			return tsw.utils.htmlEncode(s);
		}
		private static renderUpdatableChild(renderer: tsw.common.Renderer): string
		{
			var ctxParent = CtxScope.getCurrent();

			var ctx = new CtxUpdatableChild();
			ctxParent.addChildCtx(ctx);
			ctx.renderer = renderer;
			ctx.id = ctxParent.generateNextChildId();

			//console.log('getElmCtx: %o', ctx.getElmCtx());

			var innerHtml = CtxScope.use(ctx, () =>
			{
				var content = renderer.render();
				return RenderUtils.renderHtml(content);
			});

			var markers = new HtmlBlockMarkers(ctx.id);
			return markers.getHtml(innerHtml);
		}
		private static renderElement(elm: tsw.elements.elm): string
		{
			var tagName = elm.z_getTagName();
			//console.log(elm, tagName);

			var children = elm.z_getChildren();
			//console.log('children: ', children);

			if (!tagName)
			{
				var innerHtml = RenderUtils.renderHtml(children);
				return innerHtml;
			}

			var ctxParent = CtxScope.getCurrent();

			var ctx = new CtxElement();
			ctxParent.addChildCtx(ctx);
			ctx.id = ctxParent.generateNextChildId();
			elm.z_setId(ctx.id);

			var innerHtml = CtxScope.use(ctx, () => RenderUtils.renderHtml(children));
			var attrsHtml = CtxScope.use(ctx, () => this.getElmAttrHtml(elm));
			//console.log('attrsHtml: [%s]', attrsHtml);

			var html = '<' + tagName;

			html = tsw.utils.appendDelimited(html, ' ', attrsHtml);

			html += '>';

			if (innerHtml) html += innerHtml;

			if (innerHtml || this.elmNeedsCloseTag(tagName))
			{
				html += '</' + tagName + '>';
			}

			return html;
		}
		private static elmNeedsCloseTag(tagName: string):boolean
		{
			var tagNameUpper = tagName.toUpperCase();

			var needNoClosingTag = tagNameUpper == "IMG" || tagNameUpper == "INPUT" || tagNameUpper == "BR" ||
				tagNameUpper == "HR" || tagNameUpper == "BASE" || tagNameUpper == "COL" ||
				tagNameUpper == "COLGROUP" || tagNameUpper == "KEYGEN" || tagNameUpper == "META" || tagNameUpper == "WBR";

			return !needNoClosingTag;
		}
		private static getElmAttrHtml(elm: tsw.elements.elm): string
		{
			var attrsHtml = '';

			var attrs = RenderUtils.getElmAttrs(elm); // attr names in lower case
			//console.log('attrs: ', attrs);

			for (var attrName in attrs)
			{
				if (attrs.hasOwnProperty(attrName))
				{
					var attrVal = this.getAttrVal(attrs, attrName);
					//console.log('%s=[%o]', attrName, attrVal);

					if (attrVal !== null)
					{
						var attrHtml = attrName;
						if (attrVal) attrHtml += '=' + this.quoteAttrVal(attrVal);

						attrsHtml = tsw.utils.appendDelimited(attrsHtml, ' ', attrHtml);
					}
				}
			}

			return attrsHtml;
		}
		private static getAttrVal(attrs: { [name: string]: any[] }, attrName: string): string
		{
			var attrVal = '';

			var attrVals: any[] = attrs[attrName];
			//console.log('attrName: %s; attrVals: %o', attrName, attrVals);

			var hasRenderer: boolean;
			var fn: () => any;

			if (attrName == 'class')
			{
				hasRenderer = attrVals.some(av => this.canBeRenderer(av));
				fn = () => tsw.utils.join(attrVals, ' ', av => this.getRenderedValue(av));
			}
			else if (attrName == 'style')
			{
				hasRenderer = attrVals.some(av => this.canBeRendererStyle(av));
				fn = () => tsw.utils.join(attrVals, '; ', av => this.getRenderedStyleValue(av));
			}
			else
			{
				hasRenderer = attrVals.some(av => this.canBeRenderer(av));
				fn = () => tsw.utils.join(attrVals, ', ', av => this.getRenderedValue(av));
			}

			if (hasRenderer)
			{
				var renderer = new Renderer();
				renderer.render = fn;

				var ctxParent = CtxScope.getCurrent();

				var ctx = new CtxUpdatableAttr();
				ctxParent.addChildCtx(ctx);
				ctx.attrName = attrName;
				ctx.renderer = renderer;

				attrVal = CtxScope.use(ctx, fn);
			}
			else
			{
				attrVal = fn();
			}

			return attrVal;
		}
		private static getElmAttrs(elm: tsw.elements.elm): { [name: string]: any[] }
		{
			var attrs: { [name: string]: any[] } = {};

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

		private static canBeRenderer(item: any): boolean
		{
			if (item instanceof Function) return true;
			if (item.render instanceof Function) return true;

			return false;
		}
		private static getRenderer(item: any): tsw.common.Renderer
		{
			if (item instanceof Function)
			{
				var r = new Renderer();
				r.render = item;
				return r;
			}

			if (item.render instanceof Function)
			{
				var r = new Renderer();
				r.render = item.render;

				if (item.beforeRemove instanceof Function) r.beforeRemove = item.beforeRemove;
				if (item.afterInsert instanceof Function) r.afterInsert = item.afterInsert;

				return r;
			}

			return null;
		}
		private static getRenderedValue(item: any): any
		{
			var renderer = this.getRenderer(item);
			var v = renderer ? renderer.render() : item;
			return v === true ? '' : v === false ? null : v;
		}
		private static canBeRendererStyle(item: any): boolean
		{
			if (!item.name) return this.canBeRenderer(item);

			return this.canBeRenderer(item.value);
		}
		private static getRenderedStyleValue(item: any): any
		{
			if (!item.name) return this.getRenderedValue(item);

			var v1 = this.getRenderedValue(item.value);
			if (v1 != null && v1 !== '') return item.name + ": " + v1;
			return '';
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

	class Renderer implements tsw.common.Renderer
	{
		render: tsw.common.RendererFn;
		beforeRemove: () => void;
		afterInsert: () => void;
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
