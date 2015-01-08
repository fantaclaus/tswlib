module tsw.render
{
	export class RenderingNode
	{
		public update()
		{
		}
	}

	export class Root
	{
		private htmlElement: HTMLElement;
		private _content: any;

		public attachTo(htmlElement: HTMLElement)
		{
			this.htmlElement = htmlElement;
		}
		public content(c: any): void
		{
			this._content = c;
		}
		public update()
		{
			var ctx = new CtxRootElement();
			var htm = CtxScope.use(ctx, () => RenderUtils.renderHtml(this._content));
			console.log('html: [%s]', htm);
			this.htmlElement.innerHTML = htm;
		}
	}

	export class Ctx
	{
		children: Ctx[] = [];

		update(): void
		{
		}
	}

	class CtxRootElement extends Ctx
	{

	}

	class CtxElement extends Ctx
	{

	}

	class CtxUpdatableChild extends Ctx
	{
		renderer: tsw.common.Renderer;
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

	export class RenderUtils
	{
		public static renderHtml(content: any): string
		{
			var items = [];
			RenderUtils.addExpanded(items, content);

			var htm = tsw.utils.join(items, null, item => RenderUtils.renderItem(item));
			return htm;
		}
		private static renderItem(item: any): string
		{
			if (typeof item == 'boolean') return '';

			if (item instanceof tsw.common.rawHtml) return (<tsw.common.rawHtml> item).value;

			if (item instanceof tsw.elements.elm)
			{
				return this.renderElement(<tsw.elements.elm> item);
			}

			var renderer = this.getRenderer(item);
			if (renderer)
			{
				return this.renderUpdatableChild(renderer);
			}

			var s = item.toString();
			return tsw.utils.htmlEncode(s);
		}
		private static renderUpdatableChild(renderer: tsw.common.Renderer): string
		{
			var ctx = new CtxUpdatableChild();
			ctx.renderer = renderer;

			var innerHtml = CtxScope.use(ctx, () =>
			{
				var content = renderer.render();
				return RenderUtils.renderHtml(content);
			});

			var id = '1';
			var marker = new HtmlBlockMarkers(id);
			return "<!--" + marker.begin + "-->" + innerHtml + "<!--" + marker.end + "-->";
		}
		private static renderElement(elm: tsw.elements.elm): string
		{
			//console.log(elm, elm.z_getTagName());

			var children = elm.z_getChildren();
			//console.log('children: ', children);

			var ctx = new CtxElement();
			var innerHtml = CtxScope.use(ctx, () => RenderUtils.renderHtml(children));

			var tagName = elm.z_getTagName();
			if (!tagName) return innerHtml;

			var attrsHtml = this.getElmAttrHtml(elm);
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
		private static getElmAttrHtml(elm): string
		{
			var attrsHtml = '';

			var attrs = RenderUtils.getElmAttrs(elm); // attr names in lower case
			//console.log('attrs: ', attrs);

			for (var attrName in attrs)
			{
				if (attrs.hasOwnProperty(attrName))
				{
					var attrVal = this.getAttrVal(attrs, attrName);

					var attrHtml = attrName;
					if (attrVal) attrHtml += '=' + this.quoteAttrVal(attrVal);

					attrsHtml = tsw.utils.appendDelimited(attrsHtml, ' ', attrHtml);
				}
			}

			return attrsHtml;
		}
		private static getAttrVal(attrs: { [name: string]: any[] }, attrName:string): string
		{
			var attrVal = '';

			var attrVals: any[] = attrs[attrName];

			if (attrName == 'class')
			{
				attrVal = tsw.utils.join(attrVals, ' ', av => av);
			}
			else if (attrName == 'style')
			{
				attrVal = tsw.utils.join(attrVals, '; ', av =>
				{
					var v = '';

					if (av.name && av.value)
					{
						v = av.name + ": " + av.value;
					}
					else
					{
						v = av;
					}

					return v;
				});
			}
			else
			{
				attrVal = tsw.utils.join(attrVals, ', ', av => av);
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
						var attrName = a.name.toLowerCase();
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

		public static getRenderer(item: any): tsw.common.Renderer
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
				return r;
			}

			return null;
		}

		public static addExpanded(target: any[], v: any): void
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
			return "<!--" + this.begin + "-->" + innerHtml + "<!--" + this.end + "-->";
		}
	}
}
