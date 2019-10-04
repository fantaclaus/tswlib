import { Ctx, NodeKind } from './Ctx';
import { Scope } from './CtxScope';
import { childValType, childValTypePropDefReadable, Renderer, attrValTypeInternal2, attrValTypeInternal, EventHandler, AttrNameValue } from './types';
import { log, logCtx } from 'lib/dbgutils';
import { ElementGeneric } from './elm';
import { RawHtml, ElementWithValue, IElementWithValue } from './htmlElements';
import { CtxAttr } from './CtxAttr';

export class CtxNodes extends Ctx
{
	private firstChild: Node | null = null;
	private lastChild: Node | null = null;

	constructor(private content: () => childValType)
	{
		super();
	}
	setup(parentNode: DocumentFragment | Element)
	{
		const ctxParent = Scope.getCurrent();
		if (!ctxParent) throw new Error("No scope parent");

		this.ctxRoot = ctxParent.getRootCtx();
		//console.log('this.ctxRoot=', this.ctxRoot);

		this.addNodes(parentNode);

		this.addCtxToParent();
	}
	update()
	{
		log(console.debug, 'CtxNodes update:', logCtx(this));

		if (!this.lastChild) throw new Error("this.lastChild is null");

		const parentNode = this.lastChild.parentNode;
		if (!parentNode) throw new Error("parentNode is null");

		const nodeBefore = this.lastChild.nextSibling;

		this.detachPropVals();

		const firstChildOld = this.firstChild;
		const lastChildOld = this.lastChild;

		this.removeNodes(parentNode);
		this.removeChildren();

		const f = document.createDocumentFragment();

		this.addNodes(f);

		if (this.ctxRoot) this.ctxRoot.invokeBeforeAttach();

		parentNode.insertBefore(f, nodeBefore);

		if (this.ctxParent)
		{
			this.ctxParent.replaceNode(NodeKind.first, firstChildOld, this.firstChild);
			this.ctxParent.replaceNode(NodeKind.last, lastChildOld, this.lastChild);
		}
	}
	replaceNode(nodeKind: NodeKind, oldNode: Node | null, newNode: Node | null): void
	{
		let matched = false;

		switch (nodeKind)
		{
			case NodeKind.first:
				if (this.firstChild == oldNode)
				{
					this.firstChild = newNode;
					matched = true;
				}
				break;

			case NodeKind.last:
				if (this.lastChild == oldNode)
				{
					this.lastChild = newNode;
					matched = true;
				}
				break;
		}

		if (matched && this.ctxParent) this.ctxParent.replaceNode(nodeKind, oldNode, newNode);
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
	private addNodes(parentNode: DocumentFragment | Element)
	{
		const parentLastChild = parentNode.lastChild;

		// f.appendChild(document.createComment(`${this.id} start`));

		Scope.use(this, () =>
		{
			const r = this.content();
			addNodesTo(parentNode, r);
		});

		// f.appendChild(document.createComment(`${this.id} end`));

		let firstAddedNode = parentLastChild == null ? parentNode.firstChild : parentLastChild.nextSibling;

		// if nothing was added, add placeholder
		if (firstAddedNode == null)
		{
			const placeholderNode = document.createComment('placeholder');
			parentNode.appendChild(placeholderNode);

			firstAddedNode = placeholderNode;
		}

		this.firstChild = firstAddedNode;
		this.lastChild = parentNode.lastChild;
	}
}

export function addNodesTo(parentNode: DocumentFragment | Element, item: childValType)
{
	if (item == null || item === true || item === false || item === '') return;

	if (item instanceof Array)
	{
		for (let i of item)
		{
			addNodesTo(parentNode, i);
		}
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
		const children = item.z_children();
		const tagName = item.z_tagName();
		if (tagName)
		{
			const el = createElement(tagName, item);

			addNodesTo(el, children);

			parentNode.appendChild(el);
		}
		else
		{
			addNodesTo(parentNode, children);
		}
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


function createElement(tagName: string, item: ElementGeneric)
{
	const el = document.createElement(tagName);

	createAttrs(item, el);

	if (item instanceof ElementWithValue)
	{
		const pd = item.z_getPropDef();
		if (pd)
		{
			const elInput = item as IElementWithValue;
			const valuePropName = elInput.z_getValuePropName();
			const pv = pd;

			function inputHandler(this: Element, e: Event)
			{
				const value = (el as unknown as { [name: string]: any })[valuePropName];
				pv.set(value);
			}

			el.addEventListener('input', inputHandler);
			el.addEventListener('change', inputHandler);
		}
	}

	const events = item.z_events();
	if (events)
	{
		for (let eh of events)
		{
			if (tagName == 'A' && eh.eventName.toLowerCase() == 'click')
			{
				const handler = eh.handleEvent;
				el.addEventListener(eh.eventName, function (this: Element, e)
				{
					e.preventDefault();
					handler.call(this, e);
				});
			}
			else
			{
				el.addEventListener(eh.eventName, eh.handleEvent);
			}
		}
	}

	return el;
}
function createAttrs(elm: ElementGeneric, el: HTMLElement)
{
	const elm_attrs = elm.z_attrs();

	if (elm_attrs)
	{
		const attrs = createAttrMap(elm_attrs);

		for (let [attrName, attrValue] of attrs)
		{
			const ctx = new CtxAttr(el, attrName, attrValue);
			ctx.setup();
		}
	}
}

function createAttrMap(elm_attrs: AttrNameValue[])
{
	const attrs = new Map<string, attrValTypeInternal2>();

	for (let a of elm_attrs)
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
	}

	return attrs;
}

