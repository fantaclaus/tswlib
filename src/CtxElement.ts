import { Ref } from './Ref';
import { Ctx } from './Ctx';
import { ICtxHtmlElementOwner, implements_CtxHtmlElementOwner, ICtxRoot } from './interfaces';

export class CtxElement extends Ctx implements ICtxHtmlElementOwner
{
	private [implements_CtxHtmlElementOwner] = true;

	private id: string;
	private tagName: string;
	private refs: Ref[] | null;

	constructor(rootCtx: ICtxRoot, id: string, tagName: string, refs: Ref[] | null)
	{
		super(rootCtx);

		this.id = id;
		this.tagName = tagName;
		this.refs = refs;
	}
	getId()
	{
		return this.id;
	}
	getHtmlElement()
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
	protected unregisterEventHandlersFromRoot()
	{
		if (this.id == null) throw new Error('id is undefined');

		const ctxRoot = this.getRootCtx();
		ctxRoot.detachElmEventHandlers(this.id);

		super.unregisterEventHandlersFromRoot();
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
}