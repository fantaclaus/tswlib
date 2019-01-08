﻿import { Ctx, CtxUpdatable } from "./Ctx";
import { CtxElement } from "./CtxElement";
import { CtxRoot } from "./CtxRoot";
import { CtxScope } from "./CtxScope";
import { CtxUpdatableAttr } from "./CtxUpdatableAttr";
import { CtxUpdatableChild } from "./CtxUpdatableChild";
import { CtxUpdatableValue } from "./CtxUpdatableValue";
import { ElementGeneric } from "./elm";
import { ElementWithValue, elmValue, RawHtml } from "./htmlElements";
import { PropDefReadable } from "./PropDefs";
import { attrValType, childValType, EventHandler, EventHandlerMap, PropDefReadableAttrValType, PropDefReadableChildValType, Renderer, StyleRule } from "./types";
import * as utils from "./utils";
import { HtmlBlockMarkers } from "./HtmlBlockMarkers";

function isPropDefChild(attrVal: childValType): attrVal is PropDefReadableChildValType
{
	return (<PropDefReadableChildValType>attrVal).get instanceof Function;
}
function isRenderer(item: childValType): item is Renderer
{
	return (<Renderer>item).render instanceof Function;
}

export function renderHtml(rootCtx: Ctx, content: childValType)
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
	function renderItem(rootCtx: Ctx, item: childValType)
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
	}
	function renderUpdatableChild(rootCtx: Ctx, item: childValType)
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
	function renderElement(rootCtx: Ctx, elm: ElementGeneric)
	{
		type MapStringToArrayOfAttrValType = Map<string, attrValType[]>;

		interface ValueData
		{
			value: elmValue;
			ctx: CtxUpdatable;
			valPropName: string;
		}

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
		const propDef = elmWithVal && elmWithVal.z_getPropDef();
		const useVal = propDef && propDef.get instanceof Function;

		const valData = getValData();

		const attrsHtml = CtxScope.use(ctx, () => getElmAttrHtml(rootCtx, attrs));
		//console.log(`attrsHtml: [${attrsHtml}]`);

		const innerHtml = renderInnerHtml();

		const hasEventHanders = attachEventHandlers();

		if (elmRefs)
		{
			const ctxId = ctx.getId();
			elmRefs.forEach(r =>
			{
				r.set(ctxId);
			});
		}

		const hasRefs = elmRefs != null && elmRefs.length > 0;

		return makeHtml(tagName, attrsHtml, innerHtml, hasEventHanders, hasRefs, ctx);

		function getValData()
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
		function renderInnerHtml()
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
		function attachEventHandlers()
		{
			let eventHanders = elm.z_getEventHandlers();

			if (useVal && valData && propDef && propDef.set instanceof Function)
			{
				const eventHanders2 = eventHanders || new Map<string, EventHandler>();

				const savedHandlers = new Map<string, EventHandler>();
				copyMapValue(savedHandlers, eventHanders2, 'change');
				copyMapValue(savedHandlers, eventHanders2, 'input');

				const valData2 = valData; // remove null from type
				const handler = (e: Event, htmlElement: Element) =>
				{
					const v = (<any>htmlElement)[valData2.valPropName];

					// pass ctx to CtxUtils.update for optimization: to skip it during update.

					CtxScope.use(valData2.ctx, () =>
					{
						propDef.set(v);
					});

					const userHandler = savedHandlers.get(e.type);
					if (userHandler) userHandler(e, htmlElement);
				};

				eventHanders2.set('change', handler);
				eventHanders2.set('input', handler);

				eventHanders = eventHanders2;
			}

			if (eventHanders)
			{
				const ctxRoot = ctxCurrent.getRootCtx();
				if (!(ctxRoot instanceof CtxRoot)) throw new Error("ctxRoot is not CtxRoot");

				ctxRoot.attachElmEventHandlers(ctx.getId(), eventHanders);
			}

			return eventHanders != null;

			function copyMapValue(mapDest: EventHandlerMap, mapSrc: EventHandlerMap, key: string)
			{
				const v = mapSrc.get(key);
				if (v) mapDest.set(key, v);
			}
		}
		function getElmAttrHtml(rootCtx: Ctx, attrs: MapStringToArrayOfAttrValType): string
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
		function makeHtml(tagName: string, attrsHtml: string, innerHtml: string, hasEventHanders: boolean, hasRefs: boolean, ctx: Ctx)
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
		function getAttrVal(rootCtx: Ctx, attrName: string, attrVals: attrValType[])
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
		function getValue(rootCtx: Ctx, propDef: PropDefReadable<elmValue>, valPropName: string)
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

			function getRenderedAttrValueRaw(attrVal: attrValType)
			{
				if (attrVal != null)
				{
					if (attrVal instanceof Function) return attrVal();
					if (isPropDefAttr(attrVal)) return attrVal.get();
				}
				return attrVal;
			}
		}
	}
	function htmlEncode(s: string): string
	{
		return s
			.replace(/&/g, '&amp;')
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	}
}
export function getRenderedHtml(rootCtx: Ctx, item: childValType)
{
	const content = getRenderedContent(item);
	return renderHtml(rootCtx, content);

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
}
