export interface EventHandler<T = Event>
{
	(e: T, target: Element): void;
}

export type EventHandlerMap = Map<string, EventHandler>;
