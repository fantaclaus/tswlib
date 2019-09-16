export interface EventHandler<T>
{
	(e: T, target: Element): void;
}

export interface IEvent
{
	target: any;
	type: string;
	preventDefault(): void;
}

export interface ElmEventMapItem
{
	eventName: string;
	eventType: 'dom' | 'jquery';
	handler: EventHandler<any>;
}
