import { ICtx } from "./types";

class Scope<T>
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
	use(ctx: T, action: () => void)
	{
		const prevCtx = this.current;
		this.current = ctx;

		try
		{
			action();
		}
		finally
		{
			this.current = prevCtx;
		}
	}
}

export const g_ElementHandleEvent = new Scope<Element>();
export const g_CurrentContext = new Scope<ICtx>();
