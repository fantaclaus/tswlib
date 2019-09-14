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

export interface PropDefReadableAttrValType extends PropDefReadable<attrValType> { }

export interface attrValTypeArray extends Array<attrValType> { }
export interface attrValTypeFn { (): attrValType; }
export type attrValType = string | number | boolean | StyleRule | null | undefined | attrValTypeArray | PropDefReadableAttrValType | attrValTypeFn;

export interface PropDefReadableChildValType extends PropDefReadable<childValType> { }
export interface childValTypeArray extends Array<childValType> { }
export interface childValTypeFn { (): childValType; }
export type childValType = string | number | boolean | ElementGeneric | RawHtml | Renderer | null | undefined | childValTypeArray | childValTypeFn | PropDefReadableChildValType;

export type stringValType = string | null | (() => string | null) | PropDefReadable<string | null>;
export type boolValType = boolean | (() => boolean) | PropDefReadable<boolean>;

export class StyleRule
{
	// propName: string;
	// propValue: attrValType;

	constructor(public propName: string, public propValue: attrValType)
	{
	}
}
