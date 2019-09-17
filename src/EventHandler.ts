export interface EventHandler<T>
{
	(e: T, target: Element): void;
}

export interface ElmEventMapItem
{
	eventName: string;
	eventType: string;
	handler: EventHandler<any>;
}
