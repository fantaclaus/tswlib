import { ICtx } from "./types";

class tswScope<T>
{
	private current: T | null = null;

	getCurrentSafe()
	{
		const ctx = this.getCurrent();
		if (ctx == null) throw new Error("No current context.");

		return ctx;
	}
	getCurrent()
	{
		return this.current;
	}
	use<R>(ctx: T, action: () => R)
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

export const g_CurrentContext = new tswScope<ICtx>();
