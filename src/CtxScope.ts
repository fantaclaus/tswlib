import { Ctx } from './Ctx';

export class CtxScope
{
	private static contexts: Ctx[] = [];

	static getCurrentSafe()
	{
		const ctx = this.getCurrent();
		if (ctx == null) throw new Error("No current context.");

		return ctx;
	}
	static getCurrent()
	{
		const contexts = this.contexts;
		return contexts.length == 0 ? null : contexts[contexts.length - 1];
	}
	static use<T>(ctx: Ctx, action: () => T): T
	{
		this.contexts.push(ctx);

		try
		{
			return action();
		}
		finally
		{
			this.contexts.pop();
		}
	}
}
