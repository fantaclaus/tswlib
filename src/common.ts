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

	export interface Renderer
	{
		render: () => any;
		afterAttach?: () => void;
		beforeDetach?: () => void;
	}
}
