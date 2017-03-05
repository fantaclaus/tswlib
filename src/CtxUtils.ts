﻿/**
 * @internal
 */
namespace tsw.internal
{
	interface PropKeyContext
	{
		propKey: any;
		ctx: CtxUpdatable;
	}

	let _propKeyToCtxMap: PropKeyContext[] = null;
	let _ctxUpdateQueue: CtxUpdatable[] = null;
	let _timerId: number = null;

	export function attach(propKey: any)
	{
		const ctx = getCtx();
		if (ctx)
		{
			_propKeyToCtxMap = _propKeyToCtxMap || [];

			const exists = _propKeyToCtxMap.some(p => p.propKey === propKey && p.ctx == ctx);
			if (!exists)
			{
				_propKeyToCtxMap.push({ propKey: propKey, ctx: ctx });

				//console.log('attached:', propKey.toString(), propKeyToCtxMap && propKeyToCtxMap.map(p => p.propKey));
			}
		}
	}
	export function removeCtxs(ctxs: Ctx[])
	{
		if (_propKeyToCtxMap)
		{
			//const removedKeys = propKeyToCtxMap
			//	.filter(p => ctxs.includes(p.ctx))
			//	.map(p => p.propKey);

			_propKeyToCtxMap = _propKeyToCtxMap.filter(p => !ctxs.includes(p.ctx));

			//console.log('removed: ', removedKeys, propKeyToCtxMap && propKeyToCtxMap.map(p => p.propKey));
		}
	}
	export function update(propKey: any)
	{
		const propKeyContexts = _propKeyToCtxMap && _propKeyToCtxMap.filter(p => p.propKey === propKey);
		//console.log('update req: %o; found: %o', propKey, propKeyContexts);

		if (propKeyContexts == null || propKeyContexts.length == 0) return;

		const currentCtx = getCtx(); // context that has been set in event handler for 'change' or 'input' event

		// currentCtx is checked for optimization: don't update context whose value is just set by user action

		// add contexts to ctxUpdateQueue

		const newQueue = _ctxUpdateQueue || [];

		propKeyContexts.forEach(p =>
		{
			if (p.ctx !== currentCtx && !newQueue.includes(p.ctx))
			{
				newQueue.push(p.ctx);
			}
		});

		if (newQueue.length > 0)
		{
			_ctxUpdateQueue = newQueue;

			if (!_timerId)
			{
				_timerId = window.setTimeout(() => processQueue(), 0);
			}
		}
	}
	function getCtx()
	{
		const ctx = CtxScope.getCurrent();
		return ctx ? ctx.getParentUpdatableCtx() : null;
	}
	function processQueue()
	{
		const contexts = _ctxUpdateQueue;

		_timerId = null;
		_ctxUpdateQueue = null;

		if (contexts)
		{
			const contextsToUpdate = contexts.filter(ctx => !isAnyParentInList(ctx, contexts)); // do it before ctx.update(), since parents will be set to null

			contextsToUpdate.forEach(ctx =>
			{
				//console.group('update:', ctx, ctx.id);

				ctx.update();

				//console.groupEnd();
			});
		}
	}
	function isAnyParentInList(ctx: Ctx, contexts: CtxUpdatable[])
	{
		if (!ctx) throw new Error("ctx is null");

		while (true)
		{
			const ctxParent = ctx.getParent();
			if (!ctxParent) return false;

			if (ctxParent instanceof CtxUpdatable && contexts.includes(ctxParent)) return true;

			ctx = ctxParent;
		}
	}
}