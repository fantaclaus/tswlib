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

	export type attrValSimpleType = string | number | boolean | internal.StyleRule | null;
	export type attrValCompexType = attrValSimpleType | (() => attrValType) | PropDefReadableAttrValType;
	export type attrValType = attrValCompexType | attrValCompexType[];

	export interface PropDefReadableChildValType extends global.PropDefReadable<childValType> { }

	export type childSimpleValType = string | number | boolean | elements.ElementGeneric | elements.RawHtml | Renderer | null;
	export type childComplexValType = childSimpleValType | (() => childValType) | PropDefReadableChildValType;
	export type childValType = childComplexValType | childComplexValType[];

	export type stringValType = string | null | (() => string | null) | global.PropDefReadable<string | null>;
	export type boolValType = boolean | (() => boolean) | global.PropDefReadable<boolean>;

	export interface EventHandler
	{
		(e: JQueryEventObject, target: HTMLElement): void;
	}
}

/**
 * @internal
 */
namespace tsw.internal
{
	export class StyleRule
	{
		propName: string;
		propValue: elements.attrValType;
	}

	export interface EventHandlerMap
	{
		[eventName: string]: elements.EventHandler;
	}
}

