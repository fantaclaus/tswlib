module tsw.common
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
	export interface PropVal<T>
	{
		get: () => T;
		set?: (v: T) => void;
	}
}
