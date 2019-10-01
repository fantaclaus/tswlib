import { Ctx } from './Ctx';
import { Scope } from './CtxScope';
import { childValType, childValTypePropDefReadable, Renderer, attrValTypeInternal2, attrValTypeInternal, ICtxRoot } from './types';
import { log } from 'lib/dbgutils';
import { ElementGeneric } from './elm';
import { RawHtml } from './htmlElements';
import { CtxAttr } from './CtxAttr';

export class CtxNodes extends Ctx
{
	private firstChild: Node | null = null;
	private lastChild: Node | null = null;

	constructor(private content: () => childValType)
	{
		super();
	}
	setup(parentNode: Node)
	{
		const ctxParent = Scope.getCurrent();
		if (!ctxParent) throw new Error("No scope parent");

		this.ctxRoot = ctxParent.getRootCtx();

		//console.log('this.ctxRoot=', this.ctxRoot);
		this.createNodes(parentNode, null, null);

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

		const firstChildOld = this.firstChild;
		const lastChildOld = this.lastChild;

		this.removeNodes(parentNode);
		this.removeChildren();

		this.createNodes(parentNode, nodeBefore, this.ctxRoot);

		if (this.ctxParent)
		{
			this.ctxParent.replaceNode(firstChildOld, this.firstChild);
			this.ctxParent.replaceNode(lastChildOld, this.lastChild);
		}
	}
	replaceNode(oldNode: Node | null, newNode: Node | null): void
	{
		if (this.firstChild == oldNode) this.firstChild = newNode;
		if (this.lastChild == oldNode) this.lastChild = newNode;

		if (this.ctxParent) this.ctxParent.replaceNode(oldNode, newNode);
	}
	private removeNodes(parentNode: Node)
	{
		let node = this.firstChild;

		while (true)
		{
			if (!node) throw new Error("node is null");

			const nextNode = node.nextSibling;
			parentNode.removeChild(node);

			if (node == this.lastChild) break;
			node = nextNode;
		}
	}
	private createNodes(parentNode: Node, nodeBefore: ChildNode | null, ctxRoot: ICtxRoot | null | undefined)
	{
		const f = document.createDocumentFragment();

		// f.appendChild(document.createComment(`${this.id} start`));

		Scope.use(this, () =>
		{
			const r = this.content();
			addNodesTo(f, r);
		});

		// f.appendChild(document.createComment(`${this.id} end`));

		if (!f.hasChildNodes())
		{
			f.appendChild(document.createComment('placeholder'));
		}

		this.firstChild = f.firstChild;
		this.lastChild = f.lastChild;

		if (ctxRoot) ctxRoot.invokeBeforeAttach();

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

