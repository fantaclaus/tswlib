import { Ctx } from './Ctx';
import { Scope } from './CtxScope';
import { childValType } from './types';
import { addNodesTo } from './renderNodes';

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

		if (this.hasPropVals())
		{
			const ctxParent = Scope.getCurrent();
			if (ctxParent) ctxParent.addChild(this);

			console.debug('%O added as child into %O', this, ctxParent);
		}
	}
	update()
	{
		console.debug('CtxNodes update:', this);

		this.detachPropVals();

		if (!this.lastChild) throw new Error("this.lastChild is null");

		const parentNode = this.lastChild.parentNode;
		if (!parentNode) throw new Error("parentNode is null");

		const nodeBefore = this.lastChild.nextSibling;

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