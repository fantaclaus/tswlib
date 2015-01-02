module tsw.elements
{
	export interface JQueryEventHandler
	{
		(e: JQueryEventObject): void;
	}

	export interface JQueryEventHandlerMap
	{
		[eventName: string]: JQueryEventHandler;
	}

	export class rawHtml
	{
		constructor(public value: string)
		{
		}
	}

	export interface RendererFn
	{
		(): any;
	}
	export interface Renderer
	{
		render: RendererFn;
		beforeRemove?: () => void;
		afterInsert?: () => void;
	}

	export class elm
	{
		private tagName: string;
		private _attrs: { [name: string]: any };
		private _classes: any[];

		constructor(tagName: string)
		{
			this.tagName = tagName;
		}

		attr(name: string, val: string): elm;
		attr(name: string, val: () => string): elm;
		attr(name: string, val: any): elm
		{
			return this;
		}

		cls(val: string): elm;
		cls(val: () => string): elm;
		cls(val: any): elm
		{
			return this;
		}

		style(name: string, val: string): elm;
		style(name: string, val: () => string): elm;
		style(name: string, val?: any): elm
		{
			return this;
		}

		data(name: string, val: string): elm;
		data(name: string, val: () => string): elm;
		data(name: string, val: any): elm
		{
			this.attr('data-' + name, val);

			return this;
		}
		children(items: any): elm
		{
			return this;
		}
		onclick(handler: JQueryEventHandler): elm
		{
			return this.on('click', handler);
		}
		onEvents(eventNames: string[], handler: JQueryEventHandler): elm
		{
			eventNames.forEach(e => this.on(e, handler));
			return this;
		}
		on(eventName: string, handler: JQueryEventHandler): elm
		{
			return this;
		}

		// TODO: addRef(ref: tsw.elRefs.elementRef): elm
		//{
		//
		//}

		// TODO: bind()
	}
}
