import { Ctx } from "./Ctx";
import { g_CurrentContext, g_ElementHandleEvent } from "./Scope";
import { log, logcolor } from "lib/dbgutils";

export class CtxValue extends Ctx
{
	constructor(private el: Element, private valuePropName: string, private content: () => any)
	{
		super();
	}
	setup()
	{
		this.setValue();

		this.addCtxToParent();
	}
	update(): void
	{
		this.detachPropVals();

		this.setValue();
	}
	private setValue()
	{
		g_CurrentContext.use(this, () =>
		{
			this._setValue();
		});
	}
	private _setValue()
	{
		const v = this.content();

		const el2 = g_ElementHandleEvent.getCurrent();
		if (this.el != el2)
		{
			log(console.debug, logcolor("orange"), `CTX: setValue ${this.valuePropName} of `, this.el, ` to ${v}`);

			const el = this.el as unknown as { [name: string]: any };
			el[this.valuePropName] = v;
		}
	}
}