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
			var htm = RenderUtils.renderHtml(this._content);
			console.log('html: [%s]', htm);
			this.htmlElement.innerHTML = htm;
		}
	}

	class Ctx
	{
		children: Ctx[] = [];
	}

	class CtxElementChildren extends Ctx
	{

	}

	class CtxScope
	{
		private static contexts: Ctx[] = [];

		static getCurrent(): Ctx
		{
			var contexts = this.contexts;
			return contexts.length == 0 ? null : contexts[contexts.length - 1];
		}

		static use(ctx: Ctx, action: () => void)
		{
			this.contexts.push(ctx);

			try
			{
				action();
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

			//console.log(items);

			var htm: string;

			CtxScope.use(new CtxElementChildren(), () =>
			{
				htm = tsw.utils.join(items, null, item => RenderUtils.renderItemHtml(item));
			});

			return htm;
		}
		private static renderItemHtml(item: any): string
		{
			if (typeof item == 'boolean') return '';

			if (item instanceof tsw.common.rawHtml) return (<tsw.common.rawHtml>item).value;

			if (item instanceof tsw.elements.elm)
			{
				var elm = <tsw.elements.elm> item;
				var elmHtml = this.renderElement(elm);
				return elmHtml;
			}

			var s = item.toString();

			return tsw.utils.htmlEncode(s);
		}
		private static renderElement(elm: tsw.elements.elm): string
		{
			//console.log(elm, elm.z_getTagName());

			var children = elm.z_getChildren();
			//console.log('children: ', children);
			var innerHtml = this.renderHtml(children);

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

		public static getRenderFn(renderer: any): tsw.common.RendererFn
		{
			if (renderer instanceof Function) return renderer;

			if (renderer.render) return renderer.render;

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
}
