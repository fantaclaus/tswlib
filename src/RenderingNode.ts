module tsw
{
	export class RenderingNode
	{
		public update()
		{
		}
	}

	export class RootRenderingNode extends RenderingNode
	{
		private htmlElement: HTMLElement;
		private renderer: any;

		public attachTo(htmlElement: HTMLElement)
		{
			this.htmlElement = htmlElement;
		}
		public content(renderer: tsw.elements.Renderer): void;
		public content(renderer: tsw.elements.RendererFn): void;
		public content(renderer: any): void
		{
			this.renderer = renderer;
		}
		public update()
		{
			var renderFn = RenderUtils.getRenderFn(this.renderer);
			var els = renderFn();

			var expandedEls = [];
			arrayUtils2.addExpanded(expandedEls, els);

			console.log(expandedEls);

			var htm = expandedEls.join(' ');
			this.htmlElement.innerHTML = htm;
		}
	}

	class RenderUtils
	{
		public static getRenderFn(renderer: any): tsw.elements.RendererFn
		{
			if (renderer instanceof Function) return renderer;

			if (renderer.render) return renderer.render;

			throw new Error("argument doesn't implement renderer interface");
		}
	}
}
