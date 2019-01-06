import { Ctx, CtxUpdatable } from "./Ctx";
import { CtxScope } from "./CtxScope";
import { elmValue } from "./htmlElements";
import { childValType } from "./types";

export class CtxUpdatableValue extends CtxUpdatable
{
	// private propName: string;
	// private renderFn: () => elmValue;

	getRenderFn() { return this.renderFn; }

	constructor(rootCtx: Ctx, public propName: string, public renderFn: () => elmValue)
	{
		super(rootCtx);
	}
	update()
	{
		const htmlElement = this.getHtmlElement();
		if (!htmlElement) throw new Error("htmlElement is undefined");

		const val = CtxScope.use(this, () => this.renderFn());
		//console.log("%o update: %o %s = %o", this, htmlElement, this.propName, val);

		const jqElement = jQuery(htmlElement);
		jqElement.prop(this.propName, <string & number & boolean>val);
	}
}
