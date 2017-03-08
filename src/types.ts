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

export type attrValSimpleType = string | number | boolean | StyleRule | null;
export type attrValCompexType = attrValSimpleType | (() => attrValType) | PropDefReadableAttrValType;
export type attrValType = attrValCompexType | attrValCompexType[];

export interface PropDefReadableChildValType extends PropDefReadable<childValType> { }

export type childSimpleValType = string | number | boolean | ElementGeneric | RawHtml | Renderer | null;
export type childComplexValType = childSimpleValType | (() => childValType) | PropDefReadableChildValType;
export type childValType = childComplexValType | childComplexValType[];

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
