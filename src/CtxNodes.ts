import { Ctx, NodeKind } from './Ctx';
import { g_CurrentContext } from './Scope';
import { childValType, childValTypePropDefReadable, Renderer, attrValTypeInternal2, attrValTypeInternal, AttrNameValue, ElementValueInfo, privates, childValTypeFn, ElmEventMapItem, EventKind, ICtxRoot, DomChangeEventListener } from './types';
import { log, logCtx, logPV, logcolor } from 'lib/dbgutils';
import { ElementGeneric } from './elm';
import { RawHtml, ElementWithValueBase } from './htmlElements';
import { CtxAttr } from './CtxAttr';
import { CtxValue } from './CtxValue';
import { Ref } from 'tswlibDom/ref';

export abstract class CtxNodeBase extends Ctx
{
	protected content: childValType;
	protected firstChild: Node | null = null;
	protected lastChild: Node | null = null;
	private elementsWithRootEvents: Set<Element> | undefined;
	private refs: Set<Ref> | undefined | null;

	abstract getRootCtx(): ICtxRoot;

	update()
	{
		if (this.ctxParent === null) return;

		// log(console.debug, 'CtxNodes update:', logCtx(this));

		if (!this.lastChild) throw new Error("this.lastChild is null");

		const parentNode = this.lastChild.parentNode;
		if (!parentNode) throw new Error("parentNode is null");

		const nodeBefore = this.lastChild.nextSibling;

		const firstChildOld = this.firstChild;
		const lastChildOld = this.lastChild;

		this.newMethod(parentNode, nodeBefore);

		if (this.ctxParent != null)
		{
			this.ctxParent.replaceNode(NodeKind.first, firstChildOld, this.firstChild);
			this.ctxParent.replaceNode(NodeKind.last, lastChildOld, this.lastChild);
		}
	}
	protected newMethod(parentNode: Node, nodeBefore: Node | null)
	{
		this.notifyChildren((ctx, beforeChildren) => ctx.domChange(beforeChildren, false));

		this.removeChildren();

		if (this.firstChild) this.removeNodes(parentNode);

		const f = document.createDocumentFragment();

		this.addNodes(f);

		const ctxRoot = this.getRootCtx();
		ctxRoot.invokeBeforeAttach();

		parentNode.insertBefore(f, nodeBefore);

		this.notifyChildren((ctx, beforeChildren) => ctx.domChange(beforeChildren, true));
	}

	protected shouldBeAddedToParent()
	{
		return super.shouldBeAddedToParent() ||
			(this.refs && this.refs.size > 0) ||
			(this.elementsWithRootEvents && this.elementsWithRootEvents.size > 0) ||
			(isDomChangeEventListener(this.content));
	}
	public cleanup(): void
	{
		super.cleanup();

		this.detachEventHandlers();
		this.resetRefs();
	}
	addRef(ref: Ref<Element>)
	{
		if (this.refs == null) this.refs = new Set();
		this.refs.add(ref);
	}
	private resetRefs()
	{
		if (this.refs)
		{
			this.refs.forEach(ref =>
			{
				log(console.debug, logcolor('orange'), 'CTX: reset ref ', logCtx(this), ' for ', ref.asHtmlElement());
				ref.set(null);
			});
		}
		this.refs = null;
	}
	detachEventHandlers()
	{
		if (this.elementsWithRootEvents)
		{
			this.elementsWithRootEvents.forEach(el =>
			{
				log(console.debug, logcolor('orange'), 'CTX: detach event handlers ', logCtx(this), ' for ', el)

				const ctxRoot = this.getRootCtx();
				ctxRoot.detachElmEventHandlers(el);
			});

			this.elementsWithRootEvents.clear();
		}
	}
	domChange(beforeChildren: boolean, attach: boolean): void
	{
		const content = this.content;

		if (isDomChangeEventListener(content))
		{
			const f =
				beforeChildren ?
					(attach ? content.afterAttachPre : content.beforeDetachPre) :
					(attach ? content.afterAttachPost : content.beforeDetachPost);

			if (f) f.call(content);
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
	protected removeNodes(parentNode: Node)
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
	protected addNodes(parentNode: DocumentFragment | Element)
	{
		const parentLastChild = parentNode.lastChild;

		// f.appendChild(document.createComment(`${this.id} start`));

		g_CurrentContext.use(this, () =>
		{
			const r = this.getContent();

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
	protected getContent()
	{
		if (this.content instanceof Function) return this.content();
		if (isPropDef(this.content)) return this.content.get();
		if (isRenderer(this.content)) return this.content.render();

		//return this.content;
		throw new Error("Not supported type of content");
	}
	addEventHandlers(el: Element, elmEventMapItem: ElmEventMapItem)
	{
		if (this.elementsWithRootEvents == null) this.elementsWithRootEvents = new Set();
		this.elementsWithRootEvents.add(el);

		const ctxRoot = this.getRootCtx();
		ctxRoot.attachElmEventHandler(el, elmEventMapItem);
	}

	get dbg_firstChild() { return this.firstChild; }
	get dbg_lastChild() { return this.lastChild; }
	get dbg_content() { return this.content; }
	get dbg_elementsWithRootEvents() { return this.elementsWithRootEvents; }
}

export class CtxNodes extends CtxNodeBase
{
	private ctxRoot: ICtxRoot | undefined;

	constructor(content: childValTypeFn | childValTypePropDefReadable | Renderer)
	{
		super();

		this.content = content;
	}
	getRootCtx(): ICtxRoot
	{
		if (this.ctxRoot == null) throw new Error("this.ctxRoot == null");

		return this.ctxRoot;
	}
	setup(parentNode: DocumentFragment | Element)
	{
		const ctxParent = g_CurrentContext.getCurrent();
		if (!ctxParent) throw new Error("No scope parent");

		this.ctxRoot = ctxParent.getRootCtx();

		this.addNodes(parentNode);

		this.addCtxToParent();
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
	else if (item instanceof Function || isPropDef(item) || isRenderer(item))
	{
		const ctx = new CtxNodes(item);
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
		const tagName = item[privates.ElementGeneric.tagName]();
		if (tagName)
		{
			const ns = item[privates.ElementGeneric.ns]();
			const el = createElement(tagName, ns, item);

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
	return v != null && (<childValTypePropDefReadable>v).get instanceof Function;
}
function isRenderer(v: childValType): v is Renderer
{
	return v != null && (<Renderer>v).render instanceof Function;
}
function isDomChangeEventListener(v: childValType): v is DomChangeEventListener
{
	if (v == null) return false;

	const l = <DomChangeEventListener>v;
	return (
		l.afterAttachPost instanceof Function ||
		l.afterAttachPre instanceof Function ||
		l.beforeDetachPost instanceof Function ||
		l.beforeDetachPre instanceof Function);
}

function createElement(tagName: string, ns: string | undefined, item: ElementGeneric)
{
	const el = ns ? document.createElementNS(ns, tagName) : document.createElement(tagName);

	const refs = item.z_getRefs();
	if (refs)
	{
		const ctx = g_CurrentContext.getCurrentSafe();
		for (let ref of refs)
		{
			ref.set(el);
			ctx.addRef(ref);
		}
	}

	createAttrs(item, el);

	if (item instanceof ElementWithValueBase)
	{
		const valInfos = item.z_getValueInfos();
		if (valInfos)
		{
			addValueContext(el, valInfos);
			addValueEventHandlers(el, valInfos);
		}
	}

	const events = item.z_events();
	if (events)
	{
		addEventListener(events, tagName, el);
	}

	return el;
}
function addEventListener(events: ElmEventMapItem[], tagName: string, el: Element)
{
	for (let elmEventMapItem of events)
	{
		switch (elmEventMapItem.eventKind)
		{
			case EventKind.direct:
				if (elmEventMapItem.eventType == 'dom')
				{
					if (tagName.toUpperCase() == 'A' && elmEventMapItem.eventName.toLowerCase() == 'click')
					{
						const handler = elmEventMapItem.handleEvent;
						el.addEventListener(elmEventMapItem.eventName, function (this: Element, e)
						{
							e.preventDefault();
							handler.call(this, e);
						});
					}
					else
					{
						el.addEventListener(elmEventMapItem.eventName, elmEventMapItem.handleEvent);
					}
				}
				break;

			case EventKind.onRoot:
				{
					const ctx = g_CurrentContext.getCurrentSafe();
					if (!(ctx instanceof CtxNodeBase)) throw new Error("ctx is not CtxNodes");

					ctx.addEventHandlers(el, elmEventMapItem);
				}
				break;

			default:
				throw new Error(`Unsupported eventKind: ${elmEventMapItem.eventKind}`);
		}
	}
}

function addValueContext(el: Element, valInfos: ElementValueInfo | ElementValueInfo[])
{
	if (valInfos instanceof Array)
	{
		for (let valInfo of valInfos)
		{
			addValueContext(el, valInfo);
		}
	}
	else
	{
		const ctx = new CtxValue(el, valInfos.propName, valInfos.propVal);
		ctx.setup();
	}
}
function addValueEventHandlers(el: Element, valInfos: ElementValueInfo | ElementValueInfo[])
{
	el.addEventListener('input', inputHandler);
	el.addEventListener('change', inputHandler);

	function inputHandler(this: Element, e: Event)
	{
		handleValueEvent(valInfos);

		function handleValueEvent(valInfos: ElementValueInfo | ElementValueInfo[])
		{
			if (valInfos instanceof Array)
			{
				for (let valInfo of valInfos)
				{
					handleValueEvent(valInfo);
				}
			}
			else
			{
				const value = (el as unknown as { [name: string]: any })[valInfos.propName];

				log(console.debug, logcolor("green"), 'EVENT: ', e.type, ' propName=[', valInfos.propName, '] ', logPV(<any>valInfos.propVal));

				valInfos.propVal.set(value);
			}
		}
	}
}
function createAttrs(elm: ElementGeneric, el: Element)
{
	const elm_attrs = elm.z_attrs();

	if (elm_attrs)
	{
		const attrs = createAttrMap(elm_attrs);

		attrs.forEach((attrValue, attrName) =>
		{
			const ctx = new CtxAttr(el, attrName, attrValue);
			ctx.setup();
		});
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

