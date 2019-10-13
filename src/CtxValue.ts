import { Ctx } from "./Ctx";
import { g_CurrentContext } from "./Scope";
import { log, logcolor, logCtx } from "lib/dbgutils";
import { PropDef } from "./types";

export class CtxValue extends Ctx
{
	constructor(private el: Element, private valuePropName: string, private pv: PropDef<any>)
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
		if (this.ctxParent === null) return;

		this.removeChildren();
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
		const v = this.pv.get();

		const el = this.el as unknown as { [name: string]: any };
		const currentValue = el[this.valuePropName];
		if (v !== currentValue)
		{
			log(console.debug, logcolor("brown"), `CTX: setValue `, logCtx(this), ` [${this.valuePropName}] of `, ['%o', this.el], ` to '${v}'`);

			el[this.valuePropName] = v;
		}
	}
	get dbg_el() { return this.el; }
}