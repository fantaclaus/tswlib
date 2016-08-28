import { CtxUpdatable, CtxScope, Ctx } from './Ctx';
import { arrayUtils } from './utils';

interface PropKeyContext
{
	propKey: any;
	ctx: CtxUpdatable;
}

let propKeyToCtxMap: PropKeyContext[] = null;
let ctxUpdateQueue: CtxUpdatable[] = null;
let timerId: number = null;

export function attach(propKey: any): void
{
	var ctx = getCtx();
	if (ctx)
	{
		propKeyToCtxMap = propKeyToCtxMap || [];

		var exists = propKeyToCtxMap.some(p => p.propKey === propKey && p.ctx == ctx);
		if (!exists)
		{
			propKeyToCtxMap.push({ propKey: propKey, ctx: ctx });

			//console.log('attached:', propKey.toString(), propKeyToCtxMap && propKeyToCtxMap.map(p => p.propKey));
		}
	}
}
export function removeCtxs(ctxs: Ctx[]): void
{
	if (propKeyToCtxMap)
	{
		//var removedKeys = propKeyToCtxMap
		//	.filter(p => arrayUtils.contains(ctxs, p.ctx))
		//	.map(p => p.propKey);

		propKeyToCtxMap = propKeyToCtxMap.filter(p => !arrayUtils.contains(ctxs, p.ctx));

		//console.log('removed: ', removedKeys, propKeyToCtxMap && propKeyToCtxMap.map(p => p.propKey));
	}
}
export function update(propKey: any): void
{
	var propKeyContexts = propKeyToCtxMap && propKeyToCtxMap.filter(p => p.propKey === propKey);
	//console.log('update req: %o; found: %o', propKey, propKeyContexts);

	if (propKeyContexts == null || propKeyContexts.length == 0) return;

	var currentCtx = getCtx(); // context that has been set in event handler for 'change' or 'input' event

	// currentCtx is checked for optimization: don't update context whose value is just set by user action

	// add contexts to ctxUpdateQueue

	var newQueue = ctxUpdateQueue || [];

	propKeyContexts.forEach(p =>
	{
		if (p.ctx !== currentCtx && !arrayUtils.contains(newQueue, p.ctx))
		{
			newQueue.push(p.ctx);
		}
	});

	if (newQueue.length > 0)
	{
		ctxUpdateQueue = newQueue;

		if (!timerId)
		{
			timerId = window.setTimeout(() => processQueue(), 0);
		}
	}
}
function getCtx(): CtxUpdatable
{
	var ctx = CtxScope.getCurrent();
	return ctx ? ctx.getParentUpdatableCtx() : null;
}
function processQueue(): void
{
	var contexts = ctxUpdateQueue;

	timerId = null;
	ctxUpdateQueue = null;

	if (contexts)
	{
		var contextsToUpdate = contexts.filter(ctx => !isAnyParentInList(ctx, contexts)); // do it before ctx.update(), since parents will be set to null

		contextsToUpdate.forEach(ctx =>
		{
			//console.group('update:', ctx, ctx.id);

			ctx.update();

			//console.groupEnd();
		});
	}
}
function isAnyParentInList(ctx: Ctx, contexts: CtxUpdatable[]): boolean
{
	if (!ctx) return false;

	while (true)
	{
		ctx = ctx.getParent();

		if (!ctx) return false;

		if (arrayUtils.contains(contexts, ctx)) return true;
	}
}
