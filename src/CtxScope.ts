import { Ctx } from "./Ctx";

export class Scope
{
	private static current: Ctx | null = null;

	static getCurrentSafe()
	{
		const ctx = this.getCurrent();
		if (ctx == null) throw new Error("No current context.");

		return ctx;
	}
	static getCurrent()
	{
		return this.current;
	}
	static use<T>(ctx: Ctx, action: () => T): T
	{
		const prevCtx = this.current;
		this.current = ctx;

		try
		{
			return action();
		}
		finally
		{
			this.current = prevCtx;
		}
	}
}
