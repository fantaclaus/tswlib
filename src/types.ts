import { PropDefReadable } from './PropDefs';
import { RawHtml } from "./htmlElements";
import { ElementGeneric, StyleRule } from "./elm";

export interface Renderer
{
	render: () => childValType;
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

export type childValType = string | number | boolean | ElementGeneric | RawHtml | Renderer | null | undefined | childValTypeArray | childValTypeFn | childValTypePropDefReadable;

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
}

export interface ICtxRoot
{
	invokeBeforeAttach(): void;
}

export interface IPropVal
{
	dbg_name: string | undefined;
	dbg_ctxs(): Set<ICtx> | undefined | null;
	val: any;

	ctxRemove(ctx: ICtx): void;
}

export interface IPropValEx extends IPropVal
{
	vals: any[];
	set: (v: any) => void;
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

export interface ElmEventMapItem
{
	eventName: string;
	eventType: string;
	handleEvent: EventHandler<any>;
}
