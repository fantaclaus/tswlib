import { tswRawHtml } from "./htmlElements";
import { tswElement, tswStyleRule } from "./elm";
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

export type nothing = null | undefined;

export type attrValTypeSimple = string | number | boolean | nothing;
export type attrValType = attrValTypeSimple | Fn<attrValTypeSimple> | PropDefReadable<attrValTypeSimple>;

export interface childValTypeArray extends Array<childValType> { }
export interface childValTypeFn extends Fn<childValType> { }
export interface childValTypePropDefReadable extends PropDefReadable<childValType> { }

export type childValType = string | number | boolean | tswElement | tswRawHtml | tswRenderer | DomChangeEventListener | nothing | childValTypeArray | childValTypeFn | childValTypePropDefReadable;

type stringNullable = string | nothing | false;

export interface multiStringValTypeFn extends Fn<multiStringValType> { }
export interface multiStringValTypePropDefReadable extends PropDefReadable<multiStringValType> { }
export interface multiStringValTypeArray extends Array<multiStringValType> { }

export type multiStringValType = stringNullable | multiStringValTypeFn | multiStringValTypePropDefReadable | multiStringValTypeArray;

export type singleStringValType = stringNullable | Fn<stringNullable> | PropDefReadable<stringNullable>;

export type boolValType = boolean | nothing | Fn<boolean> | PropDefReadable<boolean>;

export type attrValTypeInternal = attrValType | singleStringValType | multiStringValType | tswStyleRule;
export type attrValTypeInternal2 = attrValTypeInternal | attrValTypeInternal[];

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

export type ValueChangeHandler<T = any> = (newValue: T) => void;

export interface ElementValueInfo
{
	propName: string;
	propVal: PropDef<any>;
	onChange?: ValueChangeHandler;
}
