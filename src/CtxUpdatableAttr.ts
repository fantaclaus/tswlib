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

		// attributes 'checked' and 'value' can be changed only by property

		if (this.attrName == 'checked')
		{
			(<any>htmlElement).checked = v != null;
		}
		else if (this.attrName == 'value')
		{
			(<any>htmlElement).value = v || '';
		}
		else
		{
			if (v == null)
			{
				htmlElement.removeAttribute(this.attrName);
			}
			else
			{
				htmlElement.setAttribute(this.attrName, v);
			}
		}
	}
	protected _renderHtml(content: childValType): string
	{
		throw new Error("_renderHtml is not supported by this class");
	}
}
