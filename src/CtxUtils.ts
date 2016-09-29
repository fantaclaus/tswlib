/**
 * @internal
 */
namespace tsw.internal
{
	interface PropKeyContext
	{
		propKey: any;
		ctx: CtxUpdatable;
	}

	export class CtxUtils
	{
		private static propKeyToCtxMap: PropKeyContext[] = null;
		private static ctxUpdateQueue: CtxUpdatable[] = null;
		private static timerId: number = null;

		public static attach(propKey: any): void
		{
			var ctx = this.getCtx();
			if (ctx)
			{
				this.propKeyToCtxMap = this.propKeyToCtxMap || [];

				var exists = this.propKeyToCtxMap.some(p => p.propKey === propKey && p.ctx == ctx);
				if (!exists)
				{
					this.propKeyToCtxMap.push({ propKey: propKey, ctx: ctx });

					//console.log('attached:', propKey.toString(), this.propKeyToCtxMap && this.propKeyToCtxMap.map(p => p.propKey));
				}
			}
		}
		public static removeCtxs(ctxs: Ctx[]): void
		{
			if (this.propKeyToCtxMap)
			{
				//var removedKeys = this.propKeyToCtxMap
				//	.filter(p => ctxs.includes(p.ctx))
				//	.map(p => p.propKey);

				this.propKeyToCtxMap = this.propKeyToCtxMap.filter(p => !ctxs.includes(p.ctx));

				//console.log('removed: ', removedKeys, this.propKeyToCtxMap && this.propKeyToCtxMap.map(p => p.propKey));
			}
		}
		public static update(propKey: any): void
		{
			var propKeyContexts = this.propKeyToCtxMap && this.propKeyToCtxMap.filter(p => p.propKey === propKey);
			//console.log('update req: %o; found: %o', propKey, propKeyContexts);

			if (propKeyContexts == null || propKeyContexts.length == 0) return;

			var currentCtx = this.getCtx(); // context that has been set in event handler for 'change' or 'input' event

			// currentCtx is checked for optimization: don't update context whose value is just set by user action

			// add contexts to this.ctxUpdateQueue

			var newQueue = this.ctxUpdateQueue || [];

			propKeyContexts.forEach(p =>
			{
				if (p.ctx !== currentCtx && !newQueue.includes(p.ctx))
				{
					newQueue.push(p.ctx);
				}
			});

			if (newQueue.length > 0)
			{
				this.ctxUpdateQueue = newQueue;

				if (!this.timerId)
				{
					this.timerId = window.setTimeout(() => this.processQueue(), 0);
				}
			}
		}
		private static getCtx(): CtxUpdatable
		{
			var ctx = CtxScope.getCurrent();
			return ctx ? ctx.getParentUpdatableCtx() : null;
		}
		private static processQueue(): void
		{
			var contexts = this.ctxUpdateQueue;

			this.timerId = null;
			this.ctxUpdateQueue = null;

			if (contexts)
			{
				var contextsToUpdate = contexts.filter(ctx => !this.isAnyParentInList(ctx, contexts)); // do it before ctx.update(), since parents will be set to null

				contextsToUpdate.forEach(ctx =>
				{
					//console.group('update:', ctx, ctx.id);

					ctx.update();

					//console.groupEnd();
				});
			}
		}
		private static isAnyParentInList(ctx: Ctx, contexts: CtxUpdatable[]): boolean
		{
			if (!ctx) return false;

			while (true)
			{
				ctx = ctx.getParent();

				if (!ctx) return false;

				if (ctx instanceof CtxUpdatable && contexts.includes(ctx)) return true;
			}
		}
	}
}
