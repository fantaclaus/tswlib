import { CtxUpdatable, CtxScope, CtxUpdatableChild, CtxElement, CtxUpdatableAttr, CtxUpdatableValue } from './Ctx';
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

export function renderHtml(content: any)
{
	var items: any[] = [];
	addExpanded(items, content);

	return utils.join(items, '', item => renderItem(item));
}
function addExpanded(target: any[], v: any): void
{
	if (v == null) return;

	if (v instanceof Array)
	{
		for (var i = 0; i < v.length; i++)
		{
			addExpanded(target, v[i]);
		}
	}
	else
	{
		target.push(v);
	}
}
function renderItem(item: any): string | null
{
	if (item === true || item === false) return '';

	if (item instanceof RawHtml) return item.value;
	if (item instanceof elements.ElementGeneric) return renderElement(item);

	// content of textarea can not be updated using comment blocks, since they are displayed inside textarea as is
	var ctxCurrent = CtxScope.getCurrentSafe();
	var ctxElm = ctxCurrent.getParentHtmlElmOwnerCtx();
	var tagName = ctxElm && ctxElm.getTagName();

	//console.log('ctxElm: ', ctxElm);
	if (tagName != 'textarea')
	{
		var canBeUpdated = canItemBeUpdated(item);
		if (canBeUpdated) return renderUpdatableChild(item);
	}

	var s = item.toString();
	return utils.htmlEncode(s);
}
function renderUpdatableChild(item: any): string
{
	var ctxCurrent = CtxScope.getCurrentSafe();

	var id = ctxCurrent.generateNextChildId();

	var ctx = new CtxUpdatableChild(id, item);
	ctxCurrent.addChildCtx(ctx);

	//console.log('getElmCtx: %o', ctx.getElmCtx());

	var innerHtml = CtxScope.use(ctx, () => getRenderedHtml(item));

	var markers = new HtmlBlockMarkers(ctx.id);
	return markers.getHtml(innerHtml);
}
function renderElement(elm: elements.ElementGeneric)
{
	var tagName = elm.z_getTagName();
	//console.log(elm, tagName);

	if (!tagName)
	{
		var children = elm.z_getChildren();
		//console.log('children: ', children);

		return renderHtml(children);
	}

	var attrs = getElmAttrs(elm); // attr names in lower case
	//console.log('attrs: ', attrs);

	var elmRefs = elm.z_getRefs();

	var ctxCurrent = CtxScope.getCurrentSafe();

	var attrId = getRenderedLastAttrValue(attrs['id']);
	delete attrs['id'];

	var id = attrId || ctxCurrent.generateNextChildId();
	//console.log('id: ', id);

	var ctx = new CtxElement(id, tagName, elmRefs);
	ctxCurrent.addChildCtx(ctx);

	//logElmAttrs(elm);

	var elmWithVal = asElmWithValue(elm);
	const propDef = elmWithVal && elmWithVal.z_getPropDef();

	var useVal = propDef && propDef.get instanceof Function;
	var updateVal = useVal && propDef && propDef.set instanceof Function;

	var valData: ValueData | null = null;
	if (elmWithVal && propDef && useVal)
	{
		var valAttrName = elmWithVal.z_getValueAttrName();
		var valPropName = elmWithVal.z_getValuePropName();

		var valData2 = CtxScope.use(ctx, () => getValue(propDef, valPropName));

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

	var attrsHtml = CtxScope.use(ctx, () => getElmAttrHtml(attrs));
	//console.log(`attrsHtml: [${attrsHtml}]`);

	var innerHtml: string | null;

	if (valData && tagName == 'textarea')
	{
		innerHtml = valData.value == null ? '' : utils.htmlEncode(valData.value);
	}
	else
	{
		var children = elm.z_getChildren();
		innerHtml = CtxScope.use(ctx, () => renderHtml(children));
	}

	var eventHanders = elm.z_getEventHandlers();

	if (updateVal && propDef && valData)
	{
		const valData2 = valData; // remove null from type

		eventHanders = eventHanders || {};

		var savedHandlers: EventHandlerMap = {};
		savedHandlers['change'] = eventHanders['change'];
		savedHandlers['input'] = eventHanders['input'];

		var handler = (e: JQueryEventObject, htmlElement: HTMLElement) =>
		{
			var v = jQuery(htmlElement).prop(valData2.valPropName);

			// pass ctx to CtxUtils.update for optimization: to skip it during update.
			CtxScope.use(valData2.ctx, () =>
			{
				propDef.set(v);
			});

			var userHandler = savedHandlers[e.type];
			if (userHandler) userHandler(e, htmlElement);
		};

		eventHanders['change'] = handler;
		eventHanders['input'] = handler;
	}

	if (eventHanders)
	{
		var ctxRoot = ctxCurrent.getParentRootCtx();
		ctxRoot.attachElmEventHandlers(ctx.id, eventHanders);
	}

	if (elmRefs)
	{
		elmRefs.forEach(r =>
		{
			r.set(id);
		});
	}

	var htmlStartTag = '<' + tagName;

	var isCtxUsed = ctx.hasChildren() || eventHanders != null || elmRefs != null;
	if (isCtxUsed) htmlStartTag = utils.appendDelimited(htmlStartTag, ' ', 'id=' + quoteAttrVal(id));

	htmlStartTag = utils.appendDelimited(htmlStartTag, ' ', attrsHtml);
	htmlStartTag += '>';

	var html = htmlStartTag;

	if (innerHtml) html += innerHtml;

	if (innerHtml || elmNeedsCloseTag(tagName))
	{
		html += '</' + tagName + '>';
	}

	return html;
}

//function logElmAttrs(elm)
//{
//	var elmAttrs = elm.z_getAttrs();
//	var ss = elmAttrs.reduce((s, ea) =>
//	{
//		return utils.appendDelimited(s, ', ', utils.format('{${name}=${value}}', ea));
//	}, '');
//	console.log('attrs: ', ss);
//}

function elmNeedsCloseTag(tagName: string): boolean
{
	var tagNameUpper = tagName.toUpperCase();

	var needNoClosingTag = tagNameUpper == "IMG" || tagNameUpper == "INPUT" || tagNameUpper == "BR" ||
		tagNameUpper == "HR" || tagNameUpper == "BASE" || tagNameUpper == "COL" ||
		tagNameUpper == "COLGROUP" || tagNameUpper == "KEYGEN" || tagNameUpper == "META" || tagNameUpper == "WBR";

	return !needNoClosingTag;
}
function getElmAttrHtml(attrs: MapStringToArray): string
{
	var attrsHtml = Object.keys(attrs)
		.map(attrName => ({
			attrName: attrName,
			attrVal: getAttrVal(attrs, attrName)
		}))
		.filter(a => a.attrVal != null)
		.reduce((attrsHtml, a) =>
		{
			var attrHtml = a.attrName;
			if (a.attrVal) attrHtml += '=' + quoteAttrVal(a.attrVal);

			return utils.appendDelimited(attrsHtml, ' ', attrHtml);
		}, '');

	return attrsHtml;
}
function getAttrVal(attrs: MapStringToArray, attrName: string): string
{
	var attrVals: any[] = attrs[attrName];
	//console.log('attrName: %s; attrVals: %o', attrName, attrVals);

	var canBeUpdated: boolean;
	var fn: () => any;

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
		var ctxCurrent = CtxScope.getCurrentSafe();

		var ctx = new CtxUpdatableAttr();
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
	var attrs: MapStringToArray = {};

	var elmAttrs = elm.z_getAttrs();
	if (elmAttrs)
	{
		elmAttrs.forEach(a =>
		{
			var attrName = a.name;
			if (attrName)
			{
				var vals: any[] = attrs[attrName];
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
function quoteAttrVal(s: string): string
{
	var encoded = '';

	for (var i = 0; i < s.length; i++)
	{
		var ch = s.charAt(i);
		var cc = s.charCodeAt(i);

		var ch2: string;

		if (cc < 32 || ch == '"' || ch == "'")
		{
			ch2 = '&#x' + cc.toString(16) + ';';
		}
		else
		{
			ch2 = ch;
		}

		encoded += ch2;
	}

	return '"' + encoded + '"';
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
export function getRenderedHtml(item: any)
{
	var content = getRenderedContent(item);
	return renderHtml(content);
}
function getRenderedContent(item: any): any
{
	if (item != null)
	{
		if (item instanceof Function) return item();
		if (item.render instanceof Function) return item.render();
		if (item.get instanceof Function) return item.get();
	}

	return item;
}
function getRenderedAttrValue(item: any): any
{
	var v = getRenderedAttrValueRaw(item);
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
function getRenderedAttrValueRaw(item: any): any
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
function getRenderedStyleValue(item: elements.attrValType | elements.StyleRule): any
{
	if (typeof item === "object" && item instanceof elements.StyleRule)
	{
		var v = getRenderedAttrValue(item.propValue);

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
function getValue(propDef: PropDefReadable<any>, valPropName: string): ValueData2
{
	var ctxCurrent = CtxScope.getCurrentSafe();

	var ctx = new CtxUpdatableValue();
	ctxCurrent.addChildCtx(ctx);
	//ctx.tagName = tagName;
	ctx.propName = valPropName;
	ctx.renderFn = () => propDef.get();

	var val = CtxScope.use(ctx, ctx.renderFn);

	return { value: val, ctx: ctx };
}

export function updateInnerHtml(htmlElement: HTMLElement, id: string, html: string): void
{
	var markers = new HtmlBlockMarkers(id);
	updateDOM(htmlElement, html, markers);
}

function updateDOM(targetElement: HTMLElement, html: string, markers: HtmlBlockMarkers)
{
	// TODO: remove native event handlers

	// TBODY must be defined explicitly in onRender() of a control
	// otherwise commented section will not be found, since targetElement would be TABLE

	var COMMENT_NODE = 8; // on IE8 Node is undefined

	var nodeBeginMarker: Node | null = null;
	var nodeEndMarker: Node | null = null;
	var isFirst = false;
	var isLast = false;

	if (targetElement.hasChildNodes())
	{
		var firstNode = targetElement.firstChild;
		if (firstNode.nodeType == COMMENT_NODE && firstNode.nodeValue == markers.begin)
		{
			nodeBeginMarker = firstNode;
			isFirst = true;
		}

		var lastNode = targetElement.lastChild;
		if (lastNode.nodeType == COMMENT_NODE && lastNode.nodeValue == markers.end)
		{
			nodeEndMarker = lastNode;
			isLast = true;
		}

		if (!(isFirst && isLast))
		{
			var node = firstNode;

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
			var node = nodeBeginMarker.nextSibling;

			while (node !== nodeEndMarker)
			{
				var nodeNext = node.nextSibling;

				targetElement.removeChild(node);

				node = nodeNext;
			}

			var tmpHtmlElement = _tmpHtmlElement;
			if (!tmpHtmlElement)
			{
				tmpHtmlElement = document.createElement('span');
				_tmpHtmlElement = tmpHtmlElement; // cache it
			}

			// insert html into TABLE doesn't work on IE<10
			targetElement.insertBefore(tmpHtmlElement, nodeEndMarker);
			tmpHtmlElement.insertAdjacentHTML('beforeBegin', html);
			targetElement.removeChild(tmpHtmlElement);

			// doesn't work on IE
			// var tmp = document.createElement('template');
			// tmp.innerHTML = html;
			// targetElement.insertBefore(tmp.content, nodeEndMarker);

		}
	}
}

