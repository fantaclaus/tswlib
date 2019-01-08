import { Ctx } from './Ctx';
import { CtxScope } from "./CtxScope";
import { CtxUpdatable, isCtxUpdatable } from './interfaces';

interface PropKeyContext
{
	propKey: any;
	ctx: Ctx;
}

type CtxEventHandler = () => void;

let _propKeyToCtxMap: PropKeyContext[] | null = null;
let _ctxUpdateQueue: Set<Ctx> | null = null;
let _timerId: number | null = null;
let _updatedCbs: CtxEventHandler[] = [];

export function attach(propKey: any)
{
	const ctx = getCtx();
	if (ctx)
	{
		_propKeyToCtxMap = _propKeyToCtxMap || [];

		const exists = _propKeyToCtxMap.some(p => p.propKey === propKey && p.ctx == ctx);
		if (!exists)
		{
			_propKeyToCtxMap.push({ propKey, ctx });

			//console.log('attached:', propKey.toString(), propKeyToCtxMap && propKeyToCtxMap.map(p => p.propKey));
		}
	}
}
export function removeCtxs(ctxs: Set<Ctx>)
{
	removeAttachedCtxs(ctxs);
	removeFromUpdateQueue(ctxs);
}
function removeAttachedCtxs(ctxs: Set<Ctx>)
{
	if (_propKeyToCtxMap)
	{
		//const removedKeys = propKeyToCtxMap
		//	.filter(p => ctxs.includes(p.ctx))
		//	.map(p => p.propKey);

		_propKeyToCtxMap = _propKeyToCtxMap.filter(p => !ctxs.has(p.ctx));

		//console.log('removed: ', removedKeys, propKeyToCtxMap && propKeyToCtxMap.map(p => p.propKey));
	}
}
function removeFromUpdateQueue(ctxs: Set<Ctx>)
{
	if (_ctxUpdateQueue)
	{
		for (const ctx of ctxs)
		{
			_ctxUpdateQueue.delete(ctx);
		}
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

	const newQueue = _ctxUpdateQueue || new Set<Ctx>();

	propKeyContexts.forEach(p =>
	{
		if (p.ctx !== currentCtx)
		{
			newQueue.add(p.ctx);
		}
	});

	if (newQueue.size > 0)
	{
		_ctxUpdateQueue = newQueue;

		if (!_timerId)
		{
			_timerId = setTimeout(() => processQueue(), 0);
		}
	}
}
export function afterDOMUpdated(cb: () => void)
{
	if (_timerId)
	{
		_updatedCbs.push(cb);
	}
	else
	{
		cb();
	}
}
function getCtx()
{
	const ctx = CtxScope.getCurrent();
	if (ctx == null) return null;

	return ctx.getParentUpdatableCtx();
}

function processQueue()
{
	const contexts = _ctxUpdateQueue;

	_timerId = null;
	_ctxUpdateQueue = null;

	if (contexts)
	{
		// collect into contextsToUpdate before ctx.update(), since parents will be set to null
		const contextsToUpdate: CtxUpdatable[] = [];

		for (let ctx of contexts)
		{
			if (isCtxUpdatable(ctx))
			{
				if (!isAnyParentInList(ctx, contexts))
				{
					contextsToUpdate.push(ctx);
				}
			}
		}

		contextsToUpdate.forEach(ctx =>
		{
			//console.group('update:', ctx, ctx.id);

			ctx.update();

			//console.groupEnd();
		});
	}

	_updatedCbs.forEach(cb => cb());
	_updatedCbs.length = 0;
}
function isAnyParentInList(ctx: Ctx, contexts: Set<Ctx>)
{
	while (true)
	{
		const ctxParent = ctx.getParent();
		if (!ctxParent) return false;

		if (contexts.has(ctxParent)) return true;

		ctx = ctxParent;
	}
}
