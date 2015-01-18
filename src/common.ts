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

	export interface Renderer
	{
		render: () => any;
		beforeRemove?: () => void;
		afterInsert?: () => void;
	}

	export interface PropDef<T>
	{
		get: () => T;
		set?: (v: T) => void;
	}

	export interface PropDefInternal
	{
		unbindCtx(ctx: tsw.render.CtxUpdatable): void;
		getName(): string;
	}
}
