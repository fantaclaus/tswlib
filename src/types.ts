import { RawHtml } from "./htmlElements";
import { ElementGeneric, StyleRule } from "./elm";
import { Ref } from "./ref";

export interface Renderer
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

interface Fn<T>
{
	(): T;
}

export type attrValTypeSimple = string | number | boolean | null; // NOTE: undefined is treated as '' by attr(), so it is excluded from this type
export type attrValType = attrValTypeSimple | Fn<attrValTypeSimple> | PropDefReadable<attrValTypeSimple>;

export interface childValTypeArray extends Array<childValType> { }
export interface childValTypeFn extends Fn<childValType> { }
export interface childValTypePropDefReadable extends PropDefReadable<childValType> { }

export type childValType = string | number | boolean | ElementGeneric | RawHtml | Renderer | DomChangeEventListener | null | undefined | childValTypeArray | childValTypeFn | childValTypePropDefReadable;

type stringNullable = string | null;

export interface multiStringValTypeFn extends Fn<multiStringValType> { }
export interface multiStringValTypePropDefReadable extends PropDefReadable<multiStringValType> { }
export interface multiStringValTypeArray extends Array<multiStringValType> { }

export type multiStringValType = stringNullable | multiStringValTypeFn | multiStringValTypePropDefReadable | multiStringValTypeArray;

export type singleStringValType = stringNullable | Fn<stringNullable> | PropDefReadable<stringNullable>;

export type boolValType = boolean | Fn<boolean> | PropDefReadable<boolean>;

export type attrValTypeInternal = attrValType | singleStringValType | multiStringValType | StyleRule;
export type attrValTypeInternal2 = attrValTypeInternal | attrValTypeInternal[];

export interface ICtx
{
	id: number;
	getRootCtx(): ICtxRoot | undefined;
	addPropVal(propVal: IPropVal): void;
	addChild(ctx: ICtx): void;
	update(): void;
	getParent(): ICtx | null | undefined;
	addRef(ref: Ref<Element>): void;
}

export interface ICtxRoot
{
	invokeBeforeAttach(): void;
	attachElmEventHandler(el: Element, elmEventMapItem: ElmEventMapItem): void;
	detachElmEventHandlers(el: Element): void;
}

export interface IPropVal
{
	dbg_name: string | undefined;
	dbg_ctxs(): Set<ICtx> | undefined | null;
	val: any;

	ctxRemove(ctx: ICtx): void;
}

export interface PropDefReadable<T>
{
	get: () => T;
}
export interface PropDef<T> extends PropDefReadable<T>
{
	set: (v: T) => void;
}

export interface AttrNameValue
{
	attrName: string;
	attrValue: attrValTypeInternal;
}

export interface WindowEventMap2 extends WindowEventMap
{
	"input": InputEvent;
}

export interface EventHandler<T>
{
	(e: T): void;
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

export interface ElementValueInfo
{
	propName: string;
	propVal: PropDef<any>;
}

export namespace privates
{
	export namespace ElementGeneric
	{
		export const tagName = Symbol('ElementGeneric_tagName');
		export const ns = Symbol('ElementGeneric_ns');
		export const children = Symbol('ElementGeneric_children');
		export const addHandler = Symbol('ElementGeneric_addHandler');
		export const attrs = Symbol('ElementGeneric_attrs');
		export const events = Symbol('ElementGeneric_events');
		export const getRefs = Symbol('ElementGeneric_getRefs');
	}
	export namespace ElementWithValueBase
	{
		export const getValueInfos = Symbol('ElementGeneric_getValueInfos');
	}
}