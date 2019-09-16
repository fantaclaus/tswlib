export interface EventHandler<T>
{
	(e: T, target: Element): void;
}

export interface ElmEventMapItem
{
	eventName: string;
	isJQuery: boolean;
	handler: EventHandler<Event> | EventHandler<JQuery.Event>;
}
