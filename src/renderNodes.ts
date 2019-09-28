import { childValType, childValTypePropDefReadable, Renderer } from "../tswlibDom/types";
import { RawHtml } from "../tswlibDom/htmlElements";
import { ElementGeneric } from "tswlibDom/elm";
import { CtxNodes } from "./CtxNodes";

export function addNodesTo(parentNode: Node, item: childValType)
{
	if (item == null || item === true || item === false || item === '')
	{

	}
	else if (item instanceof Array)
	{
		item.forEach(i => addNodesTo(parentNode, i));
	}
	else if (item instanceof Function)
	{
		const ctx = new CtxNodes(item);
		ctx.setup(parentNode);
	}
	else if (isPropDef(item))
	{
		const ctx = new CtxNodes(item.get);
		ctx.setup(parentNode);
	}
	else if (isRenderer(item))
	{
		const ctx = new CtxNodes(item.render);
		ctx.setup(parentNode);
	}
	else if (item instanceof RawHtml)
	{
		const el = document.createElement('div');
		el.innerHTML = item.value;

		while (el.firstChild) parentNode.appendChild(el.firstChild);
	}
	else if (item instanceof ElementGeneric)
	{
		item.z_addNodesTo(parentNode);
	}
	else
	{
		const s = item.toString();
		const n = document.createTextNode(s);
		parentNode.appendChild(n);
	}
}

function isPropDef(v: childValType): v is childValTypePropDefReadable
{
	return (<childValTypePropDefReadable>v).get instanceof Function;
}
function isRenderer(item: childValType): item is Renderer
{
	return (<Renderer>item).render instanceof Function;
}
