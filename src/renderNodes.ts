import { childValType, childValTypePropDefReadable, Renderer } from "../tswlibDom/types";
import { RawHtml } from "../tswlibDom/htmlElements";
import { ElementGeneric } from "tswlibDom/elm";

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
		const r = item();
		addNodesTo(parentNode, r);
	}
	else if (isPropDef(item))
	{
		const r = item.get();
		addNodesTo(parentNode, r);
	}
	else if (isRenderer(item))
	{
		const r = item.render();
		addNodesTo(parentNode, r);
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
