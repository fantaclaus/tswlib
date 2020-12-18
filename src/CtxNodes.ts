import { tswCtx, NodeKind, isNotEmptySet } from './Ctx';
import { g_CurrentContext } from './Scope';
import { childValType, childValTypePropDefReadable, tswRenderer, attrValTypeInternal2, attrValTypeInternal, AttrNameValue, ElementValueInfo, childValTypeFn, ElmEventMapItem, EventKind, ICtxRoot, DomChangeEventListener, DomChangeEventListenerOld } from './types';
// import { log, logCtx, logPV, logcolor } from 'lib/dbgutils';
import { privates, tswElement } from './elm';
import { tswRawHtml, tswElementWithValueBase } from './htmlElements';
import { tswCtxAttr } from './CtxAttr';
import { tswCtxValue } from './CtxValue';
import { tswRef } from './ref';

export abstract class tswCtxNodeBase extends tswCtx
{
	protected firstChild: Node | null = null;
	protected lastChild: Node | null = null;
	private elementsWithRootEvents: Set<Element> | undefined;
	private refs: Set<tswRef> | undefined;
	private domChangeListeners: Set<DomChangeEventListener> | undefined;

	get dbg_firstChild() { return this.firstChild; }
	get dbg_lastChild() { return this.lastChild; }
	get dbg_elementsWithRootEvents() { return this.elementsWithRootEvents; }
	get dbg_domChangeListeners() { return this.domChangeListeners; }

	abstract getRootCtx(): ICtxRoot;

	protected removeOldContent(parentNode: Node)
	{
		this.notifySelfAndChildren((ctx, beforeChildren) => ctx.domChange(beforeChildren, false));

		this.removeChildren();

		if (this.firstChild) this.removeNodes(parentNode);
	}
	protected addNewContent(parentNode: Node, nodeBefore: Node | null, content: childValType)
	{
		const f = document.createDocumentFragment();

		this.addNodes(f, content);

		const ctxRoot = this.getRootCtx();
		ctxRoot.invokeBeforeAttach();

		parentNode.insertBefore(f, nodeBefore);

		this.notifySelfAndChildren((ctx, beforeChildren) => ctx.domChange(beforeChildren, true));
	}
	protected shouldBeAddedToParent()
	{
		return super.shouldBeAddedToParent() ||
			isNotEmptySet(this.refs) ||
			isNotEmptySet(this.elementsWithRootEvents) ||
			isNotEmptySet(this.domChangeListeners);
	}
	public cleanup(): void
	{
		super.cleanup();

		this.detachEventHandlers();
		this.resetRefs();
		this.domChangeListeners = undefined;
	}
	addRef(ref: tswRef)
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
				// log(console.debug, logcolor('orange'), 'CTX: reset ref ', logCtx(this), ' for ', ref.asHtmlElement());
				ref.set(null);
			});
			this.refs = undefined;
		}
	}
	detachEventHandlers()
	{
		if (this.elementsWithRootEvents)
		{
			this.elementsWithRootEvents.forEach(el =>
			{
				// log(console.debug, logcolor('orange'), 'CTX: detach event handlers ', logCtx(this), ' for ', el)

				const ctxRoot = this.getRootCtx();
				ctxRoot.detachElmEventHandlers(el);
			});

			this.elementsWithRootEvents.clear();
		}
	}
	domChange(beforeChildren: boolean, attach: boolean): void
	{
		const domChangeListeners = this.domChangeListeners;
		if (domChangeListeners)
		{
			domChangeListeners.forEach(l =>
			{
				const f =
					beforeChildren ?
						(attach ? l.afterAttachPre : l.beforeDetachPre) :
						(attach ? l.afterAttachPost : l.beforeDetachPost);

				if (f)
				{
					f.call(l);
				}
				else
				{
					const lold = <DomChangeEventListenerOld>l;

					const f2 =
						beforeChildren && attach ? lold.afterAttach :
							!beforeChildren && !attach ? lold.beforeDetach :
								null;
					if (f2)
					{
						const oldName = attach ? 'afterAttach' : 'beforeDetach';
						const newName = attach ? 'afterAttachPre' : 'beforeDetachPost';
						console.warn(`Event handler '${oldName}' is obsolete. Please, use '${newName}' instead`);
						f2.call(lold);
					}
				}
			});
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
	protected addNodes(parentNode: DocumentFragment | Element, content: childValType)
	{
		const parentLastChild = parentNode.lastChild;
		// f.appendChild(document.createComment(`${this.id} start`));
		this.insertContent(parentNode, content);
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
	addEventHandlers(el: Element, elmEventMapItem: ElmEventMapItem)
	{
		if (this.elementsWithRootEvents == null) this.elementsWithRootEvents = new Set();
		this.elementsWithRootEvents.add(el);

		const ctxRoot = this.getRootCtx();
		ctxRoot.attachElmEventHandler(el, elmEventMapItem);
	}

	private insertContent(parentNode: DocumentFragment | Element, item: childValType)
	{
		if (item == null || item === true || item === false || item === '') return;

		if (isDomChangeEventListener(item))
		{
			if (this.domChangeListeners == null) this.domChangeListeners = new Set();
			this.domChangeListeners.add(item);
		}

		if (item instanceof Array)
		{
			for (const i of item)
			{
				this.insertContent(parentNode, i);
			}
		}
		else if (item instanceof Function || isPropDef(item) || isRenderer(item))
		{
			const ctx = new tswCtxNodes(item);
			ctx.setup(this, parentNode);
		}
		else if (item instanceof tswRawHtml)
		{
			const el = document.createElement('div');
			el.innerHTML = item.value;

			while (el.firstChild) parentNode.appendChild(el.firstChild);
		}
		else if (item instanceof tswElement)
		{
			const children = item[privates.ElementGeneric.children]();
			const tagName = item[privates.ElementGeneric.tagName]();
			if (tagName)
			{
				const ns = item[privates.ElementGeneric.ns]();
				const el = this.createElement(tagName, ns, item);

				this.insertContent(el, children);

				parentNode.appendChild(el);
			}
			else
			{
				this.insertContent(parentNode, children);
			}
		}
		else
		{
			const s = item.toString();
			const n = document.createTextNode(s);
			parentNode.appendChild(n);
		}
	}
	private createElement(tagName: string, ns: string | undefined, item: tswElement)
	{
		const el = ns ? document.createElementNS(ns, tagName) : document.createElement(tagName);

		const refs = item[privates.ElementGeneric.getRefs]();
		if (refs)
		{
			for (const ref of refs)
			{
				ref.set(el);
				this.addRef(ref);
			}
		}

		this.createAttrs(item, el);

		if (item instanceof tswElementWithValueBase)
		{
			const valInfos = item[privates.ElementWithValueBase.getValueInfos]();
			if (valInfos)
			{
				this.addValueContext(el, valInfos);
				this.addValueEventHandlers(el, valInfos);
			}
		}

		const events = item[privates.ElementGeneric.events]();
		if (events)
		{
			this.addEventListeners(events, tagName, el);
		}

		return el;
	}
	private addEventListeners(events: ElmEventMapItem[], tagName: string, el: Element)
	{
		for (const elmEventMapItem of events)
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
						this.addEventHandlers(el, elmEventMapItem);
					}
					break;

				default:
					throw new Error(`Unsupported eventKind: ${elmEventMapItem.eventKind}`);
			}
		}
	}
	private addValueContext(el: Element, valInfos: ElementValueInfo | ElementValueInfo[])
	{
		if (valInfos instanceof Array)
		{
			for (const valInfo of valInfos)
			{
				this.addValueContext(el, valInfo);
			}
		}
		else
		{
			const ctx = new tswCtxValue(el, valInfos.propName, valInfos.propVal);
			ctx.setup(this);
		}
	}
	private addValueEventHandlers(el: Element, valInfos: ElementValueInfo | ElementValueInfo[])
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
					for (const valInfo of valInfos)
					{
						handleValueEvent(valInfo);
					}
				}
				else
				{
					const value = (el as unknown as { [name: string]: any })[valInfos.propName];

					// log(console.debug, logcolor("green"), 'EVENT: ', e.type, ' propName=[', valInfos.propName, '] ', logPV(<any>valInfos.propVal));

					if (valInfos.onChange)
					{
						valInfos.onChange(value, valInfos.propVal);
					}
					else
					{
						valInfos.propVal.set(value);
					}
				}
			}
		}
	}
	private createAttrs(elm: tswElement, el: Element)
	{
		const elm_attrs = elm[privates.ElementGeneric.attrs]();

		if (elm_attrs)
		{
			const isAttrCaseSensitive = elm[privates.ElementGeneric.attrsCaseSensitive]();
			const attrs = this.createAttrMap(elm_attrs, isAttrCaseSensitive);

			attrs.forEach((attrValue, attrName) =>
			{
				const ctx = new tswCtxAttr(el, attrName, attrValue);
				ctx.setup(this);
			});
		}
	}
	private createAttrMap(elm_attrs: AttrNameValue[], isAttrCaseSensitive: boolean)
	{
		const attrs = new Map<string, attrValTypeInternal2>();

		for (const a of elm_attrs)
		{
			if (a.attrName)
			{
				const attrName = isAttrCaseSensitive ? a.attrName : a.attrName.toLowerCase();
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
}

function isPropDef(v: childValType): v is childValTypePropDefReadable
{
	return v != null && (<childValTypePropDefReadable>v).get instanceof Function;
}
function isRenderer(v: childValType): v is tswRenderer
{
	return v != null && (<tswRenderer>v).render instanceof Function;
}
function isDomChangeEventListener(v: childValType): v is DomChangeEventListener
{
	if (v == null) return false;

	const l = <DomChangeEventListener>v;
	const lOld = <DomChangeEventListenerOld>v;
	return (
		l.afterAttachPost instanceof Function ||
		l.afterAttachPre instanceof Function ||
		l.beforeDetachPost instanceof Function ||
		l.beforeDetachPre instanceof Function ||
		lOld.afterAttach instanceof Function ||
		lOld.beforeDetach instanceof Function
	);
}

export class tswCtxNodes extends tswCtxNodeBase
{
	private ctxRoot: ICtxRoot | undefined;

	constructor(private content: childValTypeFn | childValTypePropDefReadable | tswRenderer)
	{
		super();
	}
	getRootCtx(): ICtxRoot
	{
		if (this.ctxRoot == null) throw new Error("this.ctxRoot == null");

		return this.ctxRoot;
	}
	setup(ctxParent: tswCtx, parentNode: DocumentFragment | Element)
	{
		// const ctxParent = g_CurrentContext.getCurrent();
		// if (!ctxParent) throw new Error("No scope parent");

		this.ctxRoot = ctxParent.getRootCtx();

		const content = this.createContent();

		this.addNodes(parentNode, content);

		this.addCtxToParent(ctxParent);
	}
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

		this.removeOldContent(parentNode);

		const content = this.createContent();

		this.addNewContent(parentNode, nodeBefore, content);

		if (this.ctxParent != null)
		{
			this.ctxParent.replaceNode(NodeKind.first, firstChildOld, this.firstChild);
			this.ctxParent.replaceNode(NodeKind.last, lastChildOld, this.lastChild);
		}
	}
	private createContent()
	{
		return g_CurrentContext.use(this, () => this.getContent());
	}
	private getContent()
	{
		if (this.content instanceof Function) return this.content();
		if (isPropDef(this.content)) return this.content.get();
		if (isRenderer(this.content)) return this.content.render();

		throw new Error("Not supported type of content");
	}
	get dbg_content() { return this.content; }
}

