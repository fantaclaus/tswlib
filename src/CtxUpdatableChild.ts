import * as RenderUtils from './RenderUtils';
import { childValType, Renderer } from "./types";
import * as DOMUtils from "./DOMUtils";
import { ICtxRoot } from './interfaces';
import { CtxUpdatable } from './CtxUpdatable';

export class CtxUpdatableChild extends CtxUpdatable
{
	private id: string;

	content: childValType;

	constructor(rootCtx: ICtxRoot, id: string, content: childValType)
	{
		super(rootCtx);

		this.id = id;
		this.content = content;
	}
	getId()
	{
		return this.id;
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
		const renderer = <Renderer>this.content;
		if (renderer.beforeDetach) renderer.beforeDetach();

		super.beforeDetach();
	}
}
