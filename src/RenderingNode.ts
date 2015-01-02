module tsw
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
			var items = [];
			RenderUtils.addExpanded(items, this._content);

			console.log(items);

			CtxScope.use(new CtxElementChildren(), () =>
			{
				var ss = items.map(item => RenderUtils.renderHtml(item));
				console.log(ss);

				var htm = ss
					//.filter(s => s != '')
					//.map(s => '>' + s + '<')
					.join('\r\n');
				this.htmlElement.innerHTML = '<pre>' + htmlEncode(htm) + '</pre>';
			});
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

	class RenderUtils
	{
		public static renderHtml(item: any): string
		{
			if (typeof item == 'boolean') return '';

			if (item instanceof tsw.elements.rawHtml) return (<tsw.elements.rawHtml>item).value;

			if (item instanceof tsw.elements.elm)
			{
				var elm = <tsw.elements.elm> item;
				elmHtml = this.renderElement(elm);
			}

			var s = item.toString();

			return htmlEncode(s);
		}

		public static getRenderFn(renderer: any): tsw.elements.RendererFn
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
