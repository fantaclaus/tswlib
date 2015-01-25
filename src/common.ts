module tsw.common
{
	export interface JQueryEventHandler
	{
		(e: JQueryEventObject, target: HTMLElement): void;
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
}
