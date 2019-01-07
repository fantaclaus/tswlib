import { Ref } from './Ref';
import { CtxHtmlElementOwner } from "./Ctx";
import { CtxRoot } from "./CtxRoot";
import { childValType } from './types';
import { Ctx } from './Ctx';

export class CtxElement extends CtxHtmlElementOwner
{
	private tagName: string;
	private refs: Ref[] | null;

	constructor(rootCtx: Ctx, id: string, tagName: string, refs: Ref[] | null)
	{
		super(rootCtx);

		this.id = id;
		this.tagName = tagName;
		this.refs = refs;
	}
	protected getHtmlElement()
	{
		if (this.id == null) throw new Error('id is undefined');

		const htmlElement = document.getElementById(this.id);
		if (!htmlElement) throw new Error(`Can not find element by id: ${this.id}`);

		return htmlElement;
	}
	getTagName(): string
	{
		return this.tagName;
	}
	unregisterEventHandlersFromRoot(ctxRoot: Ctx)
	{
		if (this.id == null) throw new Error('id is undefined');
		if (!(ctxRoot instanceof CtxRoot)) throw new Error("ctxRoot is not CtxRoot");

		ctxRoot.detachElmEventHandlers(this.id);
		super.unregisterEventHandlersFromRoot(ctxRoot);
	}
	protected removeChildren()
	{
		if (this.refs)
		{
			this.refs.forEach(r => r.set(null));
			this.refs = null;
		}
		super.removeChildren();
	}
	protected _renderHtml(content: childValType): string
	{
		throw new Error("_renderHtml is not supported by this class");
	}
}