import { ICtx } from "./types";

export class Scope
{
	private static current: ICtx | null = null;

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
	static use<T>(ctx: ICtx, action: () => T): T
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
