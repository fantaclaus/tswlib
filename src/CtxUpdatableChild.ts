import { Ctx, CtxUpdatable } from "./Ctx";
import * as RenderUtils from './RenderUtils';
import { childValType, Renderer } from "./types";
import * as DOMUtils from "./DOMUtils";

export class CtxUpdatableChild extends CtxUpdatable
{
	content: childValType;

	constructor(rootCtx: Ctx, id: string, content: childValType)
	{
		super(rootCtx);

		this.id = id;
		this.content = content;
	}
	update()
	{
		this._update(this.content);
	}
	protected _renderHtml(content: childValType)
	{
		const ctxRoot = this.getRootCtx();

		return RenderUtils.getRenderedHtml(ctxRoot, content);
	}
	protected setInnerHtml(htmlElement: HTMLElement, innerHtml: string)
	{
		if (this.id == null) throw new Error('id is undefined');

		//console.log("CtxUpdatableChild.update: %o %s", htmlElement, this.id);
		DOMUtils.updateInnerHtml(htmlElement, this.id, innerHtml);
	}
	protected afterAttach()
	{
		super.afterAttach();

		const renderer = <Renderer>this.content;
		if (renderer.afterAttach) renderer.afterAttach();
	}
	protected beforeDetach()
	{
		super.beforeDetach();

		const renderer = <Renderer>this.content;
		if (renderer.beforeDetach) renderer.beforeDetach();
	}
}
