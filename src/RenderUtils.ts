import { CtxUpdatable, CtxScope, CtxUpdatableChild, CtxElement, CtxUpdatableAttr, CtxUpdatableValue } from './Ctx';
import * as elements from './elm';
import { utils } from './utils';
import { RawHtml, ElementWithValue } from './htmlElements';
import { JQueryEventHandlerMap } from './elm';
import { PropDefReadable } from './props';
import JQ from "jquery";

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

export class RenderUtils
{
	public static renderHtml(content: any): string
	{
		var items: any[] = [];
		this.addExpanded(items, content);

		return utils.join(items, null, item => this.renderItem(item));
	}
	private static renderItem(item: any): string
	{
		if (item === true || item === false) return '';

		if (item instanceof RawHtml) return item.value;
		if (item instanceof elements.ElementGeneric) return this.renderElement(item);

		// content of textarea can not be updated using comment blocks, since they are displayed inside textarea as is
		var ctxCurrent = CtxScope.getCurrent();
		var ctxElm = ctxCurrent.getParentHtmlElmOwnerCtx();
		var tagName = ctxElm ? ctxElm.getTagName() : null;

		//console.log('ctxElm: ', ctxElm);
		if (tagName != 'textarea')
		{
			var canBeUpdated = this.canBeUpdated(item);
			if (canBeUpdated) return this.renderUpdatableChild(item);
		}

		var s = item.toString();
		return utils.htmlEncode(s);
	}
	private static renderUpdatableChild(item: any): string
	{
		var ctxCurrent = CtxScope.getCurrent();

		var id = ctxCurrent.generateNextChildId();

		var ctx = new CtxUpdatableChild(id, item);
		ctxCurrent.addChildCtx(ctx);

		//console.log('getElmCtx: %o', ctx.getElmCtx());

		var innerHtml = CtxScope.use(ctx, () => this.getRenderedHtml(item));

		var markers = new HtmlBlockMarkers(ctx.id);
		return markers.getHtml(innerHtml);
	}
	private static renderElement(elm: elements.ElementGeneric): string
	{
		var tagName = elm.z_getTagName();
		//console.log(elm, tagName);

		if (!tagName)
		{
			var children = elm.z_getChildren();
			//console.log('children: ', children);

			return this.renderHtml(children);
		}

		var attrs = this.getElmAttrs(elm); // attr names in lower case
		//console.log('attrs: ', attrs);

		var elmRefs = elm.z_getRefs();

		var ctxCurrent = CtxScope.getCurrent();

		var attrId = this.getRenderedLastAttrValue(attrs['id']);
		delete attrs['id'];

		var id = attrId || ctxCurrent.generateNextChildId();
		//console.log('id: ', id);

		var ctx = new CtxElement(id, tagName, elmRefs);
		ctxCurrent.addChildCtx(ctx);

		//this.logElmAttrs(elm);

		var elmWithVal = this.asElmWithValue(elm);
		var propDef = elmWithVal && elmWithVal.z_getPropDef();

		var useVal = propDef && propDef.get instanceof Function;
		var updateVal = useVal && propDef.set instanceof Function;

		var valData: ValueData = null;
		if (useVal)
		{
			var valAttrName = elmWithVal.z_getValueAttrName();
			var valPropName = elmWithVal.z_getValuePropName();

			var valData2 = CtxScope.use(ctx, () => this.getValue(propDef, valPropName));

			// replace attributes with value of propdef (checked or value)

			if (valAttrName != null && valData2.value != null) // tagName == 'input'
			{
				//delete attrs['checked'];
				//delete attrs['value'];

				attrs[valAttrName] = [valData2.value];
			}

			valData =
				{
					value: valData2.value,
					ctx: valData2.ctx,
					valPropName: valPropName,
				};
		}

		var attrsHtml = CtxScope.use(ctx, () => this.getElmAttrHtml(attrs));
		//console.log(`attrsHtml: [${attrsHtml}]`);

		var innerHtml: string;

		if (useVal && tagName == 'textarea')
		{
			innerHtml = valData.value == null ? '' : utils.htmlEncode(valData.value);
		}
		else
		{
			var children = elm.z_getChildren();
			innerHtml = CtxScope.use(ctx, () => this.renderHtml(children));
		}

		var eventHanders = elm.z_getEventHandlers();

		if (updateVal)
		{
			eventHanders = eventHanders || {};

			var savedHandlers: JQueryEventHandlerMap = {};
			savedHandlers['change'] = eventHanders['change'];
			savedHandlers['input'] = eventHanders['input'];

			var handler = (e: JQueryEventObject, htmlElement: HTMLElement) =>
			{
				var v = JQ(htmlElement).prop(valData.valPropName);

				// pass ctx to CtxUtils.update for optimization: to skip it during update.
				CtxScope.use(valData.ctx, () =>
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
		if (isCtxUsed) htmlStartTag = utils.appendDelimited(htmlStartTag, ' ', 'id=' + this.quoteAttrVal(id));

		htmlStartTag = utils.appendDelimited(htmlStartTag, ' ', attrsHtml);
		htmlStartTag += '>';

		var html = htmlStartTag;

		if (innerHtml) html += innerHtml;

		if (innerHtml || this.elmNeedsCloseTag(tagName))
		{
			html += '</' + tagName + '>';
		}

		return html;
	}

	//private static logElmAttrs(elm)
	//{
	//	var elmAttrs = elm.z_getAttrs();
	//	var ss = elmAttrs.reduce((s, ea) =>
	//	{
	//		return utils.appendDelimited(s, ', ', utils.format('{${name}=${value}}', ea));
	//	}, '');
	//	console.log('attrs: ', ss);
	//}

	private static elmNeedsCloseTag(tagName: string): boolean
	{
		var tagNameUpper = tagName.toUpperCase();

		var needNoClosingTag = tagNameUpper == "IMG" || tagNameUpper == "INPUT" || tagNameUpper == "BR" ||
			tagNameUpper == "HR" || tagNameUpper == "BASE" || tagNameUpper == "COL" ||
			tagNameUpper == "COLGROUP" || tagNameUpper == "KEYGEN" || tagNameUpper == "META" || tagNameUpper == "WBR";

		return !needNoClosingTag;
	}
	private static getElmAttrHtml(attrs: MapStringToArray): string
	{
		var attrsHtml = Object.keys(attrs)
			.map(attrName => ({
				attrName: attrName,
				attrVal: this.getAttrVal(attrs, attrName)
			}))
			.filter(a => a.attrVal != null)
			.reduce((attrsHtml, a) =>
			{
				var attrHtml = a.attrName;
				if (a.attrVal) attrHtml += '=' + this.quoteAttrVal(a.attrVal);

				return utils.appendDelimited(attrsHtml, ' ', attrHtml);
			}, '');

		return attrsHtml;
	}
	private static getAttrVal(attrs: MapStringToArray, attrName: string): string
	{
		var attrVals: any[] = attrs[attrName];
		//console.log('attrName: %s; attrVals: %o', attrName, attrVals);

		var canBeUpdated: boolean;
		var fn: () => any;

		if (attrName == 'class')
		{
			canBeUpdated = attrVals.some(av => this.canBeUpdatedAttr(av));
			fn = () => utils.join(attrVals, ' ', av => this.getRenderedAttrValue(av));
		}
		else if (attrName == 'style')
		{
			canBeUpdated = attrVals.some(av => this.canBeUpdatedStyle(av));
			fn = () => utils.join(attrVals, '; ', av => this.getRenderedStyleValue(av));
		}
		else
		{
			canBeUpdated = attrVals.some(av => this.canBeUpdatedAttr(av));
			fn = () => this.getRenderedLastAttrValue(attrVals);
		}

		if (canBeUpdated)
		{
			var ctxCurrent = CtxScope.getCurrent();

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
	protected static getRenderedLastAttrValue(attrVals: any[]): string
	{
		// it returns last value to support overwriting of attr values
		// for example, bs.btnLink() returns <A href="#"> by default, and href could be re-assigned to another
		// value this way: bs.btnLink().href("some url")

		return attrVals && utils.join(attrVals.slice(-1), ', ', av => this.getRenderedAttrValue(av));
	}
	private static getElmAttrs(elm: elements.ElementGeneric): MapStringToArray
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
	private static quoteAttrVal(s: string): string
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

	private static canBeUpdated(item: any): boolean
	{
		if (item != null)
		{
			if (item instanceof Function) return true;
			if (item.render instanceof Function) return true; // macro element
			if (item.get instanceof Function) return true; // PropVal
		}

		return false;
	}
	public static getRenderedHtml(item: any): string
	{
		var content = this.getRenderedContent(item);
		return this.renderHtml(content);
	}
	private static getRenderedContent(item: any): any
	{
		if (item != null)
		{
			if (item instanceof Function) return item();
			if (item.render instanceof Function) return item.render();
			if (item.get instanceof Function) return item.get();
		}

		return item;
	}
	private static getRenderedAttrValue(item: any): any
	{
		var v = this.getRenderedAttrValueRaw(item);
		if (v === true) return '';
		if (v === false) return null;
		return v;
	}
	private static canBeUpdatedAttr(item: any): boolean
	{
		if (item != null)
		{
			if (item instanceof Function) return true;
			if (item.get instanceof Function) return true; // PropVal
		}
		return false;
	}
	private static getRenderedAttrValueRaw(item: any): any
	{
		if (item != null)
		{
			if (item instanceof Function) return item();
			if (item.get instanceof Function) return item.get();
		}
		return item;
	}
	private static canBeUpdatedStyle(item: elements.attrValType | elements.StyleRule): boolean
	{
		if (typeof item === "object" && item instanceof elements.StyleRule)
		{
			return this.canBeUpdatedAttr(item.propValue);
		}
		else
		{
			return this.canBeUpdatedAttr(item);
		}
	}
	private static getRenderedStyleValue(item: elements.attrValType | elements.StyleRule): any
	{
		if (typeof item === "object" && item instanceof elements.StyleRule)
		{
			var v = this.getRenderedAttrValue(item.propValue);

			if (v == null || v == '') return null;

			return item.propName + ": " + v;
		}
		else
		{
			return this.getRenderedAttrValue(item);
		}
	}
	private static asElmWithValue(elm: elements.ElementGeneric): ElementWithValue
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
	private static getValue(propDef: PropDefReadable<any>, valPropName: string): ValueData2
	{
		var ctxCurrent = CtxScope.getCurrent();

		var ctx = new CtxUpdatableValue();
		ctxCurrent.addChildCtx(ctx);
		//ctx.tagName = tagName;
		ctx.propName = valPropName;
		ctx.renderFn = () => propDef.get();

		var val = CtxScope.use(ctx, ctx.renderFn);

		return { value: val, ctx: ctx };
	}

	private static addExpanded(target: any[], v: any): void
	{
		if (v == null) return;

		if (v instanceof Array)
		{
			for (var i = 0; i < v.length; i++)
			{
				this.addExpanded(target, v[i]);
			}
		}
		else
		{
			target.push(v);
		}
	}

	public static updateInnerHtml(htmlElement: HTMLElement, id: string, html: string): void
	{
		var markers = new HtmlBlockMarkers(id);
		DOMUtils.updateDOM(htmlElement, html, markers);
	}
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
	getHtml(innerHtml: string)
	{
		let html = utils.toStringSafe(innerHtml);
		return `<!--${this.begin}-->${html}<!--${this.end}-->`;
	}
}
class DOMUtils
{
	private static tmpHtmlElement: HTMLElement;

	static updateDOM(targetElement: HTMLElement, html: string, markers: HtmlBlockMarkers)
	{
		// TODO: remove native event handlers

		// TBODY must be defined explicitly in onRender() of a control
		// otherwise commented section will not be found, since targetElement would be TABLE

		var COMMENT_NODE = 8; // on IE8 Node is undefined

		var nodeBeginMarker: Node = null;
		var nodeEndMarker: Node = null;
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
			//				utils.log('html: replace complete');
			targetElement.innerHTML = markers.getHtml(html);
		}
		else
		{
			//				utils.log('html: replace between markers');

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

				var tmpHtmlElement = this.tmpHtmlElement;
				if (!tmpHtmlElement)
				{
					tmpHtmlElement = document.createElement('span');
					this.tmpHtmlElement = tmpHtmlElement; // cache it
				}

				// insert html into TABLE doesn't work on IE<10
				targetElement.insertBefore(tmpHtmlElement, nodeEndMarker);
				tmpHtmlElement.insertAdjacentHTML('beforeBegin', html);
				targetElement.removeChild(tmpHtmlElement);

				// doesn't work on IE
				//					var tmp = document.createElement('template');
				//					tmp.innerHTML = html;
				//					targetElement.insertBefore(tmp.content, nodeEndMarker);

			}
		}
	}
}
