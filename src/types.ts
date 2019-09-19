import { PropDefReadable } from './PropDefs';
import { RawHtml } from "./htmlElements";
import { ElementGeneric } from "./elm";

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

export interface attrValTypeArray extends Array<attrValType> { }
export interface attrValTypeFn extends Fn<attrValType> {}
export interface attrValTypePropDefReadable extends PropDefReadable<attrValType> { }
export type attrValType = string | number | boolean | StyleRule | null | undefined | attrValTypeArray | attrValTypePropDefReadable | attrValTypeFn;

export interface childValTypeArray extends Array<childValType> { }
export interface childValTypeFn extends Fn<childValType> { }
export interface childValTypePropDefReadable extends PropDefReadable<childValType> { }

export type childValType = string | number | boolean | ElementGeneric | RawHtml | Renderer | null | undefined | childValTypeArray | childValTypeFn | childValTypePropDefReadable;

type StringNullable = string | null;
export type stringValType = StringNullable | Fn<StringNullable> | PropDefReadable<StringNullable>;
export type boolValType = boolean | Fn<boolean> | PropDefReadable<boolean>;

export class StyleRule
{
	// propName: string;
	// propValue: attrValType;

	constructor(public propName: string, public propValue: attrValType)
	{
	}
}
