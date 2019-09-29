import { Ctx } from './Ctx';
import { Scope } from './CtxScope';
import { childValType, childValTypePropDefReadable, Renderer, attrValTypeInternal2, attrValTypeInternal } from './types';
import { log } from 'lib/dbgutils';
import { ElementGeneric } from './elm';
import { RawHtml } from './htmlElements';
import { CtxAttr } from './CtxAttr';

export class CtxNodes extends Ctx
{
	private firstChild: ChildNode | null = null;
	private lastChild: ChildNode | null = null;

	constructor(private content: () => childValType)
	{
		super();
	}
	setup(parentNode: Node)
	{
		//this.detachPropVals();

		this.updateNodes(parentNode, null);

		this.addCtxToParent();
	}
	update()
	{
		log(console.debug, 'CtxNodes update:', this);

		if (!this.lastChild) throw new Error("this.lastChild is null");

		const parentNode = this.lastChild.parentNode;
		if (!parentNode) throw new Error("parentNode is null");

		const nodeBefore = this.lastChild.nextSibling;

		this.detachPropVals();

		this.removeNodes(parentNode);
		this.removeChildren();

		this.updateNodes(parentNode, nodeBefore);
	}
	private removeNodes(parentNode: Node)
	{
		let node = this.firstChild;
		//if (!node) throw new Error("this.firstChild is null");

		while (true)
		{
			if (!node) throw new Error("node is null");

			const nextNode = node.nextSibling;
			parentNode.removeChild(node);

			if (node == this.lastChild) break;
			node = nextNode;
		}
	}
	private updateNodes(parentNode: Node, nodeBefore: ChildNode | null)
	{
		const f = document.createDocumentFragment();

		Scope.use(this, () =>
		{
			const r = this.content();
			addNodesTo(f, r);
		});

		if (!f.hasChildNodes())
		{
			const placeHolderNode = document.createComment("placeholder");
			f.appendChild(placeHolderNode);
		}

		this.firstChild = f.firstChild;
		this.lastChild = f.lastChild;

		// TODO: if (this.onBeforeAttach) this.onBeforeAttach();

		parentNode.insertBefore(f, nodeBefore);
	}
}

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
		const ctx = new CtxNodes(item.get.bind(item));
		ctx.setup(parentNode);
	}
	else if (isRenderer(item))
	{
		const ctx = new CtxNodes(item.render.bind(item));
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
		addElmContentTo(item, parentNode);
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

function addElmContentTo(elm: ElementGeneric, parentNode: Node)
{
	if (elm.z_tagName())
	{
		const el = document.createElement(elm.z_tagName());

		createAttrs(elm, el);

		addNodesTo(el, elm.z_children());

		parentNode.appendChild(el);
	}
	else
	{
		addNodesTo(parentNode, elm.z_children());
	}
}

function createAttrs(elm: ElementGeneric, el: HTMLElement)
{
	const elm_attrs = elm.z_attrs();

	if (elm_attrs)
	{
		const attrs = new Map<string, attrValTypeInternal2>();
		elm_attrs.forEach(a =>
		{
			if (a.attrName)
			{
				const attrName = a.attrName.toLowerCase();
				const v = attrs.get(attrName);
				if (v == null)
				{
					attrs.set(attrName, a.attrValue);
				}
				else if (v instanceof Array)
				{
					const vals: attrValTypeInternal[] = v;
					vals.push(a.attrValue);
				}
				else
				{
					const vals: attrValTypeInternal[] = [];
					vals.push(v);
					vals.push(a.attrValue);
					attrs.set(attrName, vals);
				}
			}
		});
		attrs.forEach((attrValue, attrName) =>
		{
			const ctx = new CtxAttr(el, attrName, attrValue);
			ctx.setup();
		});
	}
}

