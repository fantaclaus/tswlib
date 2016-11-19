import { CtxUpdatable, CtxScope, CtxUpdatableChild, CtxElement, CtxUpdatableAttr, CtxUpdatableValue, CtxRoot } from './Ctx';
import * as elements from './elm';
import * as utils from './utils';
import { RawHtml, ElementWithValue } from './htmlElements';
import { EventHandlerMap } from './elm';
import { PropDefReadable } from './PropDefs';
//import "jquery";

interface MapStringToArray
{
	[name: string]: any[];
}
interface ValueData
{
	value: any;
	ctx: CtxUpdatable;
	valPropName: string;
}
interface ValueData2
{
	value: any;
	ctx: CtxUpdatable;
}

class HtmlBlockMarkers
{
	begin: string;
	end: string;

	constructor(id: string)
	{
		this.begin = `B:${id}`;
		this.end = `E:${id}`;
	}
	getHtml(innerHtml: string | null)
	{
		let html = innerHtml || '';
		return `<!--${this.begin}-->${html}<!--${this.end}-->`;
	}
}

let _tmpHtmlElement: HTMLElement;

export function renderHtml(rootCtx: CtxRoot, content: any)
{
	let result = '';

	addExpanded(content);

	return result;

	function addExpanded(item: any): void
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
function renderItem(rootCtx: CtxRoot, item: any): string
{
	if (item == null || item === true || item === false) return '';

	if (item instanceof RawHtml) return item.value;
	if (item instanceof elements.ElementGeneric) return renderElement(rootCtx, item);

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
	return utils.htmlEncode(s);
}
function renderUpdatableChild(rootCtx: CtxRoot, item: any): string
{
	const ctxCurrent = CtxScope.getCurrentSafe();
	const id = ctxCurrent.generateNextChildId();

	const ctx = new CtxUpdatableChild(rootCtx, id, item);
	ctxCurrent.addChildCtx(ctx);

	//console.log('getElmCtx: %o', ctx.getElmCtx());

	const innerHtml = CtxScope.use(ctx, () => getRenderedHtml(rootCtx, item));

	const markers = new HtmlBlockMarkers(ctx.id);
	return markers.getHtml(innerHtml);
}
function renderElement(rootCtx: CtxRoot, elm: elements.ElementGeneric)
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

	const attrId = getRenderedLastAttrValue(attrs['id']);
	delete attrs['id'];

	const ctxCurrent = CtxScope.getCurrentSafe();
	const id = attrId || ctxCurrent.generateNextChildId();
	//console.log('id: ', id);

	const ctx = new CtxElement(rootCtx, id, tagName, elmRefs);
	ctxCurrent.addChildCtx(ctx);

	//logElmAttrs(elm);

	const elmWithVal = asElmWithValue(elm);
	const propDef = elmWithVal && elmWithVal.z_getPropDef();

	const useVal = propDef && propDef.get instanceof Function;
	const updateVal = useVal && propDef && propDef.set instanceof Function;

	let valData: ValueData | null = null;
	if (elmWithVal && propDef && useVal)
	{
		const valAttrName = elmWithVal.z_getValueAttrName();
		const valPropName = elmWithVal.z_getValuePropName();

		const valData2 = CtxScope.use(ctx, () => getValue(rootCtx, propDef, valPropName));

		// replace attributes with value of propdef (checked or value)

		if (valAttrName != null && valData2.value != null) // tagName == 'input'
		{
			//delete attrs['checked'];
			//delete attrs['value'];

			attrs[valAttrName] = [valData2.value];
		}

		valData = {
			value: valData2.value,
			ctx: valData2.ctx,
			valPropName: valPropName,
		};
	}

	const attrsHtml = CtxScope.use(ctx, () => getElmAttrHtml(rootCtx, attrs));
	//console.log(`attrsHtml: [${attrsHtml}]`);

	let innerHtml: string;

	if (valData && tagName == 'textarea')
	{
		if (valData.value == null)
		{
			innerHtml = '';
		}
		else
		{
			innerHtml = utils.htmlEncode(valData.value);
		}
	}
	else
	{
		innerHtml = CtxScope.use(ctx, () => renderHtml(rootCtx, elm.z_getChildren()));
	}

	let eventHanders = elm.z_getEventHandlers();

	if (updateVal && propDef && valData)
	{
		const valData2 = valData; // remove null from type

		eventHanders = eventHanders || {};

		const savedHandlers: EventHandlerMap = {};
		savedHandlers['change'] = eventHanders['change'];
		savedHandlers['input'] = eventHanders['input'];

		const handler = (e: JQueryEventObject, htmlElement: HTMLElement) =>
		{
			const v = jQuery(htmlElement).prop(valData2.valPropName);

			// pass ctx to CtxUtils.update for optimization: to skip it during update.
			CtxScope.use(valData2.ctx, () =>
			{
				propDef.set(v);
			});

			const userHandler = savedHandlers[e.type];
			if (userHandler) userHandler(e, htmlElement);
		};

		eventHanders['change'] = handler;
		eventHanders['input'] = handler;
	}

	if (eventHanders)
	{
		const ctxRoot = ctxCurrent.getRootCtx();
		if (!ctxRoot) throw new Error("root ctx is null");

		ctxRoot.attachElmEventHandlers(id, eventHanders);
	}

	if (elmRefs)
	{
		elmRefs.forEach(r =>
		{
			r.set(id);
		});
	}

	let htmlStartTag = '<' + tagName;

	const isCtxUsed = ctx.hasChildren() || eventHanders != null || elmRefs != null;
	if (isCtxUsed) htmlStartTag = utils.appendDelimited(htmlStartTag, ' ', 'id=' + quote(id));

	htmlStartTag = utils.appendDelimited(htmlStartTag, ' ', attrsHtml);
	htmlStartTag = htmlStartTag + '>';

	const hasInnerHtml = !!innerHtml;
	let html = htmlStartTag;
	if (hasInnerHtml) html = html + innerHtml;
	if (hasInnerHtml || elmNeedsCloseTag(tagName)) html = html + '</' + tagName + '>';
	return html;
}
function elmNeedsCloseTag(tagName: string): boolean
{
	const tagNameUpper = tagName.toUpperCase();

	const needNoClosingTag = tagNameUpper == "IMG" || tagNameUpper == "INPUT" || tagNameUpper == "BR" ||
		tagNameUpper == "HR" || tagNameUpper == "BASE" || tagNameUpper == "COL" ||
		tagNameUpper == "COLGROUP" || tagNameUpper == "KEYGEN" || tagNameUpper == "META" || tagNameUpper == "WBR";

	return !needNoClosingTag;
}
function getElmAttrHtml(rootCtx: CtxRoot, attrs: MapStringToArray): string
{
	let attrsHtml = '';

	utils.forEachKey(attrs, attrName =>
	{
		const attrVal = getAttrVal(rootCtx, attrs, attrName);
		if (attrVal != null)
		{
			let attrHtml = attrName;
			if (attrVal) attrHtml = attrHtml + '=' + quote(encodeAttrVal(attrVal));

			attrsHtml = utils.appendDelimited(attrsHtml, ' ', attrHtml);
		}
	});

	return attrsHtml;
}
function getAttrVal(rootCtx: CtxRoot, attrs: MapStringToArray, attrName: string): string | null
{
	const attrVals: any[] = attrs[attrName];
	//console.log('attrName: %s; attrVals: %o', attrName, attrVals);

	let canBeUpdated: boolean;
	let fn: () => string | null;

	if (attrName == 'class')
	{
		canBeUpdated = attrVals.some(av => canBeUpdatedAttr(av));
		fn = () => utils.join(attrVals, ' ', av => getRenderedAttrValue(av));
	}
	else if (attrName == 'style')
	{
		canBeUpdated = attrVals.some(av => canBeUpdatedStyle(av));
		fn = () => utils.join(attrVals, '; ', av => getRenderedStyleValue(av));
	}
	else
	{
		canBeUpdated = attrVals.some(av => canBeUpdatedAttr(av));
		fn = () => getRenderedLastAttrValue(attrVals);
	}

	if (canBeUpdated)
	{
		const ctxCurrent = CtxScope.getCurrentSafe();

		const ctx = new CtxUpdatableAttr(rootCtx);
		ctxCurrent.addChildCtx(ctx);
		ctx.attrName = attrName;
		ctx.renderFn = fn;

		return CtxScope.use(ctx, fn);
	}
	else
	{
		return fn();
	}
}
function getRenderedLastAttrValue(attrVals: any[])
{
	// it returns last value to support overwriting of attr values
	// for example, bs.btnLink() returns <A href="#"> by default, and href could be re-assigned to another
	// value this way: bs.btnLink().href("some url")

	return attrVals && utils.join(attrVals.slice(-1), ', ', av => getRenderedAttrValue(av));
}
function getElmAttrs(elm: elements.ElementGeneric): MapStringToArray
{
	const attrs: MapStringToArray = {};

	const elmAttrs = elm.z_getAttrs();
	if (elmAttrs)
	{
		elmAttrs.forEach(a =>
		{
			const attrName = a.name;
			if (attrName)
			{
				let vals: any[] = attrs[attrName];
				if (!vals)
				{
					vals = [];
					attrs[attrName] = vals;
				}

				vals.push(a.value);
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
function quote(s: string)
{
	return '"' + s + '"';
}
function canItemBeUpdated(item: any): boolean
{
	if (item != null)
	{
		if (item instanceof Function) return true;
		if (item.render instanceof Function) return true; // macro element
		if (item.get instanceof Function) return true; // PropVal
	}

	return false;
}
export function getRenderedHtml(rootCtx: CtxRoot, item: any)
{
	const content = getRenderedContent(item);
	return renderHtml(rootCtx, content);
}
function getRenderedContent(item: any)
{
	if (item != null)
	{
		if (item instanceof Function) return item();
		if (item.render instanceof Function) return item.render();
		if (item.get instanceof Function) return item.get();
	}

	return item;
}
function getRenderedAttrValue(item: any)
{
	const v = getRenderedAttrValueRaw(item);
	if (v === true) return '';
	if (v === false) return null;
	return v;
}
function canBeUpdatedAttr(item: any): boolean
{
	if (item != null)
	{
		if (item instanceof Function) return true;
		if (item.get instanceof Function) return true; // PropVal
	}
	return false;
}
function getRenderedAttrValueRaw(item: any)
{
	if (item != null)
	{
		if (item instanceof Function) return item();
		if (item.get instanceof Function) return item.get();
	}
	return item;
}
function canBeUpdatedStyle(item: elements.attrValType | elements.StyleRule): boolean
{
	if (typeof item === "object" && item instanceof elements.StyleRule)
	{
		return canBeUpdatedAttr(item.propValue);
	}
	else
	{
		return canBeUpdatedAttr(item);
	}
}
function getRenderedStyleValue(item: elements.attrValType | elements.StyleRule)
{
	if (typeof item === "object" && item instanceof elements.StyleRule)
	{
		const v = getRenderedAttrValue(item.propValue);

		if (v == null || v == '') return null;

		return item.propName + ": " + v;
	}
	else
	{
		return getRenderedAttrValue(item);
	}
}
function asElmWithValue(elm: elements.ElementGeneric)
{
	if (elm instanceof ElementWithValue)
	{
		return elm;
	}
	else
	{
		return null;
	}
}
function getValue(rootCtx: CtxRoot, propDef: PropDefReadable<any>, valPropName: string): ValueData2
{
	const ctxCurrent = CtxScope.getCurrentSafe();

	const ctx = new CtxUpdatableValue(rootCtx);
	ctxCurrent.addChildCtx(ctx);
	//ctx.tagName = tagName;
	ctx.propName = valPropName;
	ctx.renderFn = () => propDef.get();

	const val = CtxScope.use(ctx, ctx.renderFn);

	return { value: val, ctx: ctx };
}

export function updateInnerHtml(htmlElement: HTMLElement, id: string, html: string): void
{
	const markers = new HtmlBlockMarkers(id);
	updateDOM(htmlElement, html, markers);
}

function updateDOM(targetElement: HTMLElement, html: string, markers: HtmlBlockMarkers)
{
	// TODO: remove native event handlers

	// TBODY must be defined explicitly in onRender() of a control
	// otherwise commented section will not be found, since targetElement would be TABLE

	const COMMENT_NODE = 8; // on IE8 Node is undefined

	let nodeBeginMarker: Node | null = null;
	let nodeEndMarker: Node | null = null;
	let isFirst = false;
	let isLast = false;

	if (targetElement.hasChildNodes())
	{
		const firstNode = targetElement.firstChild;
		if (firstNode.nodeType == COMMENT_NODE && firstNode.nodeValue == markers.begin)
		{
			nodeBeginMarker = firstNode;
			isFirst = true;
		}

		const lastNode = targetElement.lastChild;
		if (lastNode.nodeType == COMMENT_NODE && lastNode.nodeValue == markers.end)
		{
			nodeEndMarker = lastNode;
			isLast = true;
		}

		if (!(isFirst && isLast))
		{
			let node = firstNode;

			while (node)
			{
				if (node.nodeType == COMMENT_NODE)
				{
					if (node.nodeValue == markers.begin)
					{
						nodeBeginMarker = node;
					}
					else if (node.nodeValue == markers.end)
					{
						nodeEndMarker = node;
					}
				}

				node = node.nextSibling;
			}

			if (!nodeBeginMarker && nodeEndMarker)
			{
				// IE 8 removes all comments in the beginning of innerHTML
				nodeBeginMarker = firstNode;
				isFirst = true;
			}
		}
	}

	if ((isFirst && isLast) || (!nodeBeginMarker && !nodeEndMarker))
	{
		// utils.log('html: replace complete');
		targetElement.innerHTML = markers.getHtml(html);
	}
	else
	{
		// utils.log('html: replace between markers');

		// replace between markers

		if (nodeBeginMarker && nodeEndMarker)
		{
			let node = nodeBeginMarker.nextSibling;

			while (node !== nodeEndMarker)
			{
				const nodeNext = node.nextSibling;

				targetElement.removeChild(node);

				node = nodeNext;
			}

			if (!_tmpHtmlElement) _tmpHtmlElement = document.createElement('span');

			// insert html into TABLE doesn't work on IE<10
			targetElement.insertBefore(_tmpHtmlElement, nodeEndMarker);
			_tmpHtmlElement.insertAdjacentHTML('beforeBegin', html);
			targetElement.removeChild(_tmpHtmlElement);

			// doesn't work on IE
			// const tmp = document.createElement('template');
			// tmp.innerHTML = html;
			// targetElement.insertBefore(tmp.content, nodeEndMarker);

		}
	}
}
