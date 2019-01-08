import * as CtxUtils from './CtxUtils';
import { CtxScope } from './CtxScope';
import { childValType } from "./types";
import { Ctx } from './Ctx';
import { isICtxRoot } from './interfaces';

export abstract class Ctx2 extends Ctx
{
	protected _update(content: childValType)
	{
		this.beforeDetach();

		this.detachPropKeys();

		this.unregisterEventHandlersFromRoot();

		this.removeChildren();

		const htmlElement = this.getHtmlElement();
		const innerHtml = CtxScope.use(this, () => this._renderHtml(content));

		const ctxRoot = this.getRootCtx();
		ctxRoot.beforeAttach(); // call between _renderHtml and setInnerHtml to give a chance to insert css styles

		this.setInnerHtml(htmlElement, innerHtml || '');
		this.afterAttach();
	}

	protected abstract _renderHtml(content: childValType): string;
	protected abstract setInnerHtml(htmlElement: HTMLElement, innerHtml: string): void;

	private detachPropKeys()
	{
		const ctxs = new Set<Ctx>();

		collectChildContexts(this);
		CtxUtils.removeCtxs(ctxs);

		function collectChildContexts(ctx: Ctx)
		{
			ctxs.add(ctx);
			ctx.forEachChild(ctx2 => collectChildContexts(ctx2));
		}
	}
}
