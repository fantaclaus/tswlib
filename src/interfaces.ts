import { EventHandlerMap } from "./types";

/**
 * CtxHtmlElementOwner
 */
export interface CtxHtmlElementOwner
{
	getTagName(): string;
	getHtmlElement(): HTMLElement;
}

export const implements_CtxHtmlElementOwner = Symbol('tswlib.CtxHtmlElementOwner');

export function isCtxHtmlElementOwner(o: any): o is CtxHtmlElementOwner
{
	return implements_CtxHtmlElementOwner in o;
}

/**
 * CtxUpdatable
 */
export interface CtxUpdatable
{
	update(): void;
}

export const implements_CtxUpdatable = Symbol('tswlib.CtxUpdatable');

export function isCtxUpdatable(o: any): o is CtxUpdatable
{
	return implements_CtxUpdatable in o;
}

/**
 * ICtxRoot
 */
export interface ICtxRoot
{
	beforeAttach(): void;
	getNextChildId(): string;
	attachElmEventHandlers(elmId: string, eventHandlers: EventHandlerMap): void;
	detachElmEventHandlers(elmId: string): void;
}

export const implements_ICtxRoot = Symbol('tswlib.ICtxRoot');

export function isICtxRoot(o: any): o is ICtxRoot
{
	return implements_ICtxRoot in o;
}
