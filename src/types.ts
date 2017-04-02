import { PropDefReadable } from './PropDefs';
import { RawHtml } from "./htmlElements";
import { ElementGeneric } from "./elm";

export interface Renderer
{
	render: () => childValType;
	afterAttach?: () => void;
	beforeDetach?: () => void;
}

export interface PropDefReadableAttrValType extends PropDefReadable<attrValType> { }

interface attrValTypeArray extends Array<attrValType> { }
interface attrValTypeFn { (): attrValType; }
export type attrValType = string | number | boolean | StyleRule | null | attrValTypeArray | PropDefReadableAttrValType | attrValTypeFn;

export interface PropDefReadableChildValType extends PropDefReadable<childValType> { }
interface childValTypeArray extends Array<childValType> { }
interface childValTypeFn { (): childValType; }
export type childValType = string | number | boolean | ElementGeneric | RawHtml | Renderer | null | childValTypeArray | childValTypeFn | PropDefReadableChildValType;

export type stringValType = string | null | (() => string | null) | PropDefReadable<string | null>;
export type boolValType = boolean | (() => boolean) | PropDefReadable<boolean>;

export interface EventHandler
{
	(e: JQueryEventObject, target: HTMLElement): void;
}

export class StyleRule
{
	propName: string;
	propValue: attrValType;
}

export interface EventHandlerMap
{
	[eventName: string]: EventHandler;
}
