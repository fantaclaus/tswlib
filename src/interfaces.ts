import { ElmEventMapItem } from './EventHandler';
import { Ctx } from "./Ctx";

/**
 * ICtxHtmlElementOwner
 */
export interface ICtxHtmlElementOwner
{
	getTagName(): string;
	getHtmlElement(): HTMLElement;
}

export const implements_CtxHtmlElementOwner = Symbol('tswlib.ICtxHtmlElementOwner');

export function isCtxHtmlElementOwner(o: any): o is ICtxHtmlElementOwner
{
	return o && implements_CtxHtmlElementOwner in o;
}

/**
 * ICtxUpdatable
 */
export interface ICtxUpdatable
{
	update(): void;
	addPropVal(propVal: IPropVal): void;
	isAnyParentInList(contexts: Set<ICtxUpdatable>): boolean;
}

export const implements_CtxUpdatable = Symbol('tswlib.ICtxUpdatable');

export function isCtxUpdatable(o: any): o is ICtxUpdatable
{
	return o && implements_CtxUpdatable in o;
}

/**
 * ICtxRoot
 */
export interface ICtxRoot
{
	beforeAttach(): void;
	getNextChildId(): string;
	attachElmEventHandler(elmId: string, elmEventMapItem: ElmEventMapItem): void;
	detachElmEventHandlers(elmId: string): void;
}

export const implements_ICtxRoot = Symbol('tswlib.ICtxRoot');

export function isICtxRoot(o: any): o is ICtxRoot
{
	return o && implements_ICtxRoot in o;
}


export interface IPropVal
{
	ctxAdd(ctx: ICtxUpdatable): void;
	ctxRemove(ctx: ICtxUpdatable): void;
	ctxGetAll(): Set<ICtxUpdatable>;
}
