import { Ctx, CtxUpdatable } from './Ctx';
import { CtxScope } from "./CtxScope";
import { childValType } from './types';

export class CtxUpdatableAttr extends CtxUpdatable
{
	//attrName: string;
	//renderFn: () => string | null;

	constructor(rootCtx: Ctx, public attrName: string, public renderFn: () => string | null)
	{
		super(rootCtx);
	}
	update()
	{
		const htmlElement = this.getHtmlElement();
		if (!htmlElement) throw new Error("htmlElement is undefined");
		//console.log("%o update: %o %s", this, htmlElement, this.attrName);

		const v = CtxScope.use(this, () => this.renderFn());

		//console.log("%o update: %o %s = %o", this, htmlElement, this.attrName, v);

		const jqElement = jQuery(htmlElement);

		// attributes checked and value can be changed only by $.prop()

		if (this.attrName == 'checked')
		{
			jqElement.prop('checked', v != null);
		}
		else if (this.attrName == 'value')
		{
			jqElement.prop('value', v || '');
		}
		else
		{
			if (v == null)
				jqElement.removeAttr(this.attrName);
			else
				jqElement.attr(this.attrName, v);
		}
	}
}
