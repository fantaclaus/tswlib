namespace tsw
{
	export interface Renderer
	{
		render: () => elements.childValType;
		afterAttach?: () => void;
		beforeDetach?: () => void;
	}
}

namespace tsw.elements
{
	export interface PropDefReadableAttrValType extends global.PropDefReadable<attrValType> { }

	interface attrValTypeArray extends Array<attrValType> { }
	interface attrValTypeFn { (): attrValType; }
	export type attrValType = string | number | boolean | StyleRule | null | attrValTypeArray | PropDefReadableAttrValType | attrValTypeFn;

	export interface PropDefReadableChildValType extends global.PropDefReadable<childValType> { }
	interface childValTypeArray extends Array<childValType> { }
	interface childValTypeFn { (): childValType; }
	export type childValType = string | number | boolean | elements.ElementGeneric | elements.RawHtml | Renderer | null | childValTypeArray | childValTypeFn | PropDefReadableChildValType;

	export type stringValType = string | null | (() => string | null) | global.PropDefReadable<string | null>;
	export type boolValType = boolean | (() => boolean) | global.PropDefReadable<boolean>;

	export interface EventHandler
	{
		(e: JQueryEventObject, target: HTMLElement): void;
	}

	export class StyleRule
	{
		propName: string;
		propValue: elements.attrValType;
	}
}

/**
 * @internal
 */
namespace tsw.internal
{
	export interface EventHandlerMap
	{
		[eventName: string]: elements.EventHandler;
	}
}

