import { CtxElement } from "./CtxElement";
import { CtxScope } from "./CtxScope";
import { CtxUpdatableAttr } from "./CtxUpdatableAttr";
import { CtxUpdatableChild } from "./CtxUpdatableChild";
import { CtxUpdatableValue } from "./CtxUpdatableValue";
import { ElementGeneric } from "./elm";
import { ElementWithValue, elmValue, RawHtml, IElementWithValue } from "./htmlElements";
import { PropDefReadable } from "./PropDefs";
import { attrValType, childValType, EventHandler, EventHandlerMap, PropDefReadableAttrValType, PropDefReadableChildValType, Renderer, StyleRule } from "./types";
import * as utils from "./utils";
import { HtmlBlockMarkers } from "./HtmlBlockMarkers";
import { ICtxRoot } from "./interfaces";
import { Ctx } from "./Ctx";
import { PropDef } from "./PropDefs";

type MapStringToArrayOfAttrValType = Map<string, attrValType[]>;
type ValDataType = { value: elmValue; ctx: CtxUpdatableValue; valPropName: string; };

function isPropDefChild(attrVal: childValType): attrVal is PropDefReadableChildValType
{
	return (<PropDefReadableChildValType>attrVal).get instanceof Function;
}
function isRenderer(item: childValType): item is Renderer
{
	return (<Renderer>item).render instanceof Function;
}

export function renderHtml(rootCtx: ICtxRoot, content: childValType)
{
	let result = '';

	addExpanded(content);

	return result;

	function addExpanded(item: childValType)
	{
		if (item == null) return;

		if (item instanceof Array)
		{
			for (let i = 0; i < item.length; i++)
			{
				addExpanded(item[i]);
			}
		}
		else
		{
			const s = renderItem(rootCtx, item);

			if (s != null && s !== '') // don't add nulls and empty strings. but zero (number) value must be added.
			{
				result = result + s;
			}
		}
	}
}
function renderItem(rootCtx: ICtxRoot, item: childValType)
{
	if (item == null || item === true || item === false) return '';

	if (item instanceof RawHtml) return item.value;
	if (item instanceof ElementGeneric) return renderElement(rootCtx, item);

	// content of textarea can not be updated using comment blocks, since they are displayed inside textarea as is
	const ctxCurrent = CtxScope.getCurrentSafe();
	const ctxElm = ctxCurrent.getParentHtmlElmOwnerCtx();
	const tagName = ctxElm && ctxElm.getTagName();

	//console.log('ctxElm: ', ctxElm);
	if (tagName != 'textarea')
	{
		const canBeUpdated = canItemBeUpdated(item);
		if (canBeUpdated) return renderUpdatableChild(rootCtx, item);
	}

	const s = item.toString();
	return htmlEncode(s);

}
function canItemBeUpdated(item: childValType)
{
	if (item != null)
	{
		if (item instanceof Function) return true;
		if (isRenderer(item)) return true; // macro element
		if (isPropDefChild(item)) return true;
	}

	return false;
}
function renderUpdatableChild(rootCtx: ICtxRoot, item: childValType)
{
	const ctxCurrent = CtxScope.getCurrentSafe();
	const id = ctxCurrent.generateNextChildId();

	const ctx = new CtxUpdatableChild(rootCtx, id, item);
	ctxCurrent.addChildCtx(ctx);

	//console.log('getElmCtx: %o', ctx.getElmCtx());

	const innerHtml = CtxScope.use(ctx, () => getRenderedHtml(rootCtx, item));

	const markers = new HtmlBlockMarkers(ctx.getId());
	return markers.getHtml(innerHtml);
}
function renderElement(rootCtx: ICtxRoot, elm: ElementGeneric)
{
	const tagName = elm.z_getTagName();
	//console.log(elm, tagName);

	if (!tagName)
	{
		const children = elm.z_getChildren();
		//console.log('children: ', children);

		return renderHtml(rootCtx, children);
	}

	const attrs = getElmAttrs(elm); // attr names in lower case
	//console.log('attrs: ', attrs);

	const elmRefs = elm.z_getRefs();

	const attrId = getRenderedLastAttrValue(attrs.get('id'));
	attrs.delete('id');

	const ctxCurrent = CtxScope.getCurrentSafe();
	const id = attrId || ctxCurrent.generateNextChildId();
	//console.log('id: ', id);

	const ctx = new CtxElement(rootCtx, id, tagName, elmRefs);
	ctxCurrent.addChildCtx(ctx);

	//logElmAttrs(elm);

	const elmWithVal = asElmWithValue(elm);
	const propDef = elmWithVal == null ? undefined : elmWithVal.z_getPropDef();
	const useVal = propDef != null && propDef.get instanceof Function;

	const valData = getValData(rootCtx, elmWithVal, propDef, useVal, attrs, ctx);

	const attrsHtml = CtxScope.use(ctx, () => getElmAttrHtml(rootCtx, attrs));
	//console.log(`attrsHtml: [${attrsHtml}]`);

	const innerHtml = renderInnerHtml(rootCtx, valData, tagName, elm, ctx);

	const ctxRoot = ctxCurrent.getRootCtx();
	const hasEventHanders1 = attachEventHandlersPropVal(ctxRoot, valData, propDef, useVal, ctx);
	const hasEventHanders2 = attachEventHandlersElm(ctxRoot, ctx, elm);

	if (elmRefs)
	{
		const ctxId = ctx.getId();
		elmRefs.forEach(r =>
		{
			r.set(ctxId);
		});
	}

	const hasRefs = elmRefs != null && elmRefs.length > 0;

	return makeHtml(tagName, attrsHtml, innerHtml, hasEventHanders1 || hasEventHanders2, hasRefs, ctx);
}
function getValData(rootCtx: ICtxRoot, elmWithVal: IElementWithValue | null, propDef: PropDefReadable<elmValue> | undefined, useVal: boolean, attrs: Map<string, attrValType[]>, ctx: Ctx)
{
	if (elmWithVal && propDef && useVal)
	{
		const valAttrName = elmWithVal.z_getValueAttrName();
		const valPropName = elmWithVal.z_getValuePropName();
		const valData = CtxScope.use(ctx, () => getValue(rootCtx, propDef, valPropName));
		// replace attributes with value of propdef (checked or value)
		if (valAttrName != null && valData.value != null) // tagName == 'input'
		{
			//delete attrs['checked'];
			//delete attrs['value'];
			attrs.set(valAttrName, [valData.value]);
		}

		return valData;
	}
	else
	{
		return null;
	}
}
function isPropDefAttr(attrVal: attrValType): attrVal is PropDefReadableAttrValType
{
	return (<PropDefReadableAttrValType>attrVal).get instanceof Function;
}
function renderInnerHtml(rootCtx: ICtxRoot, valData: ValDataType | null, tagName: string, elm: ElementGeneric, ctx: Ctx)
{
	if (valData && tagName == 'textarea')
	{
		return valData.value == null ? '' : htmlEncode(valData.value.toString());
	}
	else
	{
		const children = elm.z_getChildren();
		return CtxScope.use(ctx, () => renderHtml(rootCtx, children));
	}
}
function attachEventHandlersPropVal(ctxRoot: ICtxRoot, valData: ValDataType | null, propDef: PropDef<elmValue> | undefined, useVal: boolean, ctx: CtxElement)
{
	if (useVal && valData && propDef && propDef.set instanceof Function)
	{
		const handler = createHandler(propDef, valData.valPropName, valData.ctx);

		const eventHanders = new Map<string, EventHandler>();
		eventHanders.set('change', handler);
		eventHanders.set('input', handler);

		ctxRoot.attachElmEventHandlers(ctx.getId(), eventHanders);

		return true;
	}
	else
	{
		return false;
	}
}
function createHandler(propDef: PropDef<elmValue>, valPropName: string, ctx: CtxUpdatableValue)
{
	// put in separate function to minimize the number of captured objects (in closures)

	return (e: Event, htmlElement: Element) =>
	{
		const v = (<any>htmlElement)[valPropName];

		// console.log('propval handler', e, v);

		// pass ctx to CtxUtils.update for optimization: to skip it during update.
		CtxScope.use(ctx, () =>
		{
			propDef.set(v);
		});
	};
}
function attachEventHandlersElm(ctxRoot: ICtxRoot, ctx: CtxElement, elm: ElementGeneric)
{
	const eventHanders = elm.z_getEventHandlers();
	if (!eventHanders) return false;

	ctxRoot.attachElmEventHandlers(ctx.getId(), eventHanders);

	return true;
}
function getElmAttrHtml(rootCtx: ICtxRoot, attrs: MapStringToArrayOfAttrValType): string
{
	let attrsHtml = '';

	attrs.forEach((attrVals, attrName) =>
	{
		const attrVal = getAttrVal(rootCtx, attrName, attrVals);
		if (attrVal != null)
		{
			let attrHtml = attrName;
			if (attrVal) attrHtml = attrHtml + '=' + quote(encodeAttrVal(attrVal));

			attrsHtml = utils.appendDelimited(attrsHtml, ' ', attrHtml);
		}
	});

	return attrsHtml;
}
function makeHtml(tagName: string, attrsHtml: string, innerHtml: string, hasEventHanders: boolean, hasRefs: boolean, ctx: CtxElement)
{
	let htmlStartTag = '<' + tagName;
	if (ctx.hasChildren() || hasEventHanders || hasRefs)
	{
		htmlStartTag = utils.appendDelimited(htmlStartTag, ' ', 'id=' + quote(ctx.getId()));
	}
	htmlStartTag = utils.appendDelimited(htmlStartTag, ' ', attrsHtml);
	htmlStartTag = htmlStartTag + '>';

	const hasInnerHtml = !!innerHtml;

	let html = htmlStartTag;
	if (hasInnerHtml) html = html + innerHtml;
	if (hasInnerHtml || elmNeedsCloseTag(tagName)) html = html + '</' + tagName + '>';
	return html;
}
function quote(s: string)
{
	return '"' + s + '"';
}
function getAttrVal(rootCtx: ICtxRoot, attrName: string, attrVals: attrValType[])
{
	//console.log('attrName: %s; attrVals: %o', attrName, attrVals);

	let canBeUpdated: boolean;
	let fn: () => string | null;

	if (attrName == 'class')
	{
		canBeUpdated = attrVals.some(av => canBeUpdatedAttr(av));
		fn = () => joinAttrVals(attrVals, ' ', av => getRenderedAttrValue(av));
	}
	else if (attrName == 'style')
	{
		canBeUpdated = attrVals.some(av => canBeUpdatedStyle(av));
		fn = () => joinAttrVals(attrVals, '; ', av => getRenderedStyleValue(av));
	}
	else
	{
		canBeUpdated = attrVals.some(av => canBeUpdatedAttr(av));
		fn = () => getRenderedLastAttrValue(attrVals);
	}

	if (canBeUpdated)
	{
		const ctxCurrent = CtxScope.getCurrentSafe();

		const ctx = new CtxUpdatableAttr(rootCtx, attrName, fn);
		ctxCurrent.addChildCtx(ctx);

		return CtxScope.use(ctx, fn);
	}
	else
	{
		return fn();
	}

}
function canBeUpdatedStyle(attrVal: attrValType)
{
	if (attrVal instanceof StyleRule)
	{
		return canBeUpdatedAttr(attrVal.propValue);
	}
	else
	{
		return canBeUpdatedAttr(attrVal);
	}
}
function getRenderedStyleValue(attrVal: attrValType)
{
	if (attrVal instanceof StyleRule)
	{
		const v = getRenderedAttrValue(attrVal.propValue);

		if (v == null || v == '') return null;

		return attrVal.propName + ": " + v;
	}
	else
	{
		return getRenderedAttrValue(attrVal);
	}
}
function canBeUpdatedAttr(attrVal: attrValType)
{
	if (attrVal != null)
	{
		if (attrVal instanceof Function) return true;
		if (isPropDefAttr(attrVal)) return true;
	}
	return false;
}
function getRenderedLastAttrValue(attrVals: attrValType[] | undefined)
{
	// it returns last value to support overwriting of attr values
	// for example, bs.btnLink() returns <A href="#"> by default, and href could be re-assigned to another
	// value this way: bs.btnLink().href("some url")

	return attrVals == null ? null : joinAttrVals(attrVals.slice(-1), ', ', av => getRenderedAttrValue(av));
}
function elmNeedsCloseTag(tagName: string): boolean
{
	const tagNameUpper = tagName.toUpperCase();

	const needNoClosingTag = tagNameUpper == "IMG" || tagNameUpper == "INPUT" || tagNameUpper == "BR" ||
		tagNameUpper == "HR" || tagNameUpper == "BASE" || tagNameUpper == "COL" ||
		tagNameUpper == "COLGROUP" || tagNameUpper == "KEYGEN" || tagNameUpper == "META" || tagNameUpper == "WBR";

	return !needNoClosingTag;
}
function joinAttrVals(attrVals: attrValType[], delim: string, selector: (av: attrValType) => attrValType)
{
	// if all items are null, return null

	let result: string | null = null;

	if (attrVals)
	{
		for (let i = 0; i < attrVals.length; i++)
		{
			const attrVal = attrVals[i];
			if (attrVal != null)
			{
				const attrVal2 = selector(attrVal);

				if (attrVal2 != null)
				{
					if (result == null) result = ''; // if at least one attrVal is converted to non-null, result is not null

					if (attrVal2 !== '') // don't append nulls and empty strings. but zero-number value must be appended.
					{
						if (delim && result) result = result + delim;

						result = result + attrVal2;
					}
				}
			}
		}
	}

	return result;
}
function getElmAttrs(elm: ElementGeneric)
{
	const attrs = new Map<string, attrValType[]>();

	const elmAttrs = elm.z_getAttrs();
	if (elmAttrs)
	{
		elmAttrs.forEach(a =>
		{
			const attrName = a.attrName;
			if (attrName)
			{
				let vals = attrs.get(attrName);
				if (!vals)
				{
					vals = [];
					attrs.set(attrName, vals);
				}

				vals.push(a.attrValue);
			}
		});
	}

	return attrs;
}
function encodeAttrVal(s: string)
{
	let encoded = '';

	for (let i = 0; i < s.length; i++)
	{
		const ch = s.charAt(i);
		const cc = s.charCodeAt(i);

		let ch2: string;

		if (cc < 32 || ch == '"' || ch == "'")
		{
			ch2 = '&#x' + cc.toString(16) + ';';
		}
		else
		{
			ch2 = ch;
		}

		encoded = encoded + ch2;
	}

	return encoded;
}
function asElmWithValue(elm: ElementGeneric)
{
	return elm instanceof ElementWithValue ? elm : null;
}
function getValue(rootCtx: ICtxRoot, propDef: PropDefReadable<elmValue>, valPropName: string)
{
	const ctxCurrent = CtxScope.getCurrentSafe();

	const ctx = new CtxUpdatableValue(rootCtx, valPropName, () => propDef.get());
	ctxCurrent.addChildCtx(ctx);

	const val = CtxScope.use(ctx, ctx.getRenderFn());

	return { value: val, ctx: ctx, valPropName: valPropName };
}
function getRenderedAttrValue(attrVal: attrValType)
{
	const v = getRenderedAttrValueRaw(attrVal);
	if (v === true) return '';
	if (v === false) return null;
	return v;

}
function getRenderedAttrValueRaw(attrVal: attrValType)
{
	if (attrVal != null)
	{
		if (attrVal instanceof Function) return attrVal();
		if (isPropDefAttr(attrVal)) return attrVal.get();
	}
	return attrVal;
}
function htmlEncode(s: string): string
{
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}
export function getRenderedHtml(rootCtx: ICtxRoot, item: childValType)
{
	const content = getRenderedContent(item);
	return renderHtml(rootCtx, content);
}
function getRenderedContent(item: childValType)
{
	if (item != null)
	{
		if (item instanceof Function) return item();
		if (isRenderer(item)) return item.render();
		if (isPropDefChild(item)) return item.get();
	}

	return item;
}
