import { tswRawHtml } from "./htmlElements";
import { tswElement } from "./elm";
import { tswRef } from "./ref";

export interface tswRenderer
{
	render: () => childValType;
}

export interface DomChangeEventListener
{
	afterAttachPre?: () => void;
	afterAttachPost?: () => void;
	beforeDetachPre?: () => void;
	beforeDetachPost?: () => void;
}

export interface DomChangeEventListenerOld
{
	afterAttach?: () => void; // same as afterAttachPre
	beforeDetach?: () => void; // same as beforeDetachPost
}

export interface Fn<T>
{
	(): T;
}

export type TypeX<T> = T | Fn<TypeX<T>> | PropDefReadable<TypeX<T>>;
export type TypeXA<T> = T | Fn<TypeXA<T>> | PropDefReadable<TypeXA<T>> | Array<TypeXA<T>>;

export type nothing = null | undefined;

export type attrValType = TypeX<string | number | boolean | nothing>;
export type attrValTypeEx = TypeX<string | number | boolean | nothing | object>;

type stringNullable = string | nothing | false;

export type singleStringValType = TypeX<stringNullable>;
export type multiStringValType = TypeXA<stringNullable>;

export type boolValType = TypeX<boolean | nothing>;

export type attrValTypeInternal = TypeXA<string | number | boolean | nothing | object>;

// child val types

export type childValTypeFn = Fn<childValType>;
export type childValTypePropDefReadable = PropDefReadable<childValType>;

export type childValType = TypeXA<string | number | boolean | tswElement | tswRawHtml | tswRenderer | DomChangeEventListener | nothing>;

export interface ICtx
{
	id: number;
	getRootCtx(): ICtxRoot | nothing;
	addPropVal(propVal: IPropVal): void;
	addChild(ctx: ICtx): void;
	update(): void;
	getParent(): ICtx | nothing;
	addRef(ref: tswRef): void;
}

export interface ICtxRoot
{
	invokeBeforeAttach(): void;
	attachElmEventHandler(el: Element, elmEventMapItem: ElmEventMapItem): void;
	detachElmEventHandlers(el: Element): void;
}

export interface IPropVal
{
	dbg_name?: string;
	dbg_ctxs(): Set<ICtx> | nothing;
	val: any;

	ctxRemove(ctx: ICtx): void;
}

export interface PropDefReadable<T>
{
	get: () => T;
}
export interface PropDef<T> extends PropDefReadable<T>
{
	set: (v: T) => boolean;
}

export interface AttrNameValue
{
	attrName: string;
	attrValue: attrValTypeInternal;
	conv?: (v: string | object) => string;
}

export interface WindowEventMap2 extends WindowEventMap
{
	"input": InputEvent;
}

export interface EventHandler<T>
{
	(e: T, el: Element): void;
}

export enum EventKind
{
	direct,
	onRoot,
}

export interface ElmEventMapItem
{
	eventName: string;
	eventType: string;
	eventKind: EventKind;
	handleEvent: EventHandler<any>;
}

export type ValueChangeHandler = () => void;

export interface ElementValueInfo
{
	propName: string;
	propVal: PropDef<any>;
}
