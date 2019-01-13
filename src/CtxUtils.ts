import { CtxScope } from "./CtxScope";
import { ICtxUpdatable, IPropVal, isCtxUpdatable } from './interfaces';

type CtxEventHandler = () => void;

let _ctxUpdateQueue: Set<ICtxUpdatable> | null = null;
let _timerId: number | undefined;
let _updatedCbs: CtxEventHandler[] = [];

export function attach(pv: IPropVal)
{
	const ctx = getCtx();
	if (ctx) ctx.addPropVal(pv);
}
export function removeCtx(ctx: ICtxUpdatable)
{
	if (_ctxUpdateQueue) _ctxUpdateQueue.delete(ctx);
}
export function update(pv: IPropVal)
{
	const ctxs = pv.ctxGetAll();
	if (ctxs == null || ctxs.size == 0) return;

	const currentCtx = getCtx(); // context that has been set in event handler for 'change' or 'input' event

	// currentCtx is checked for optimization: don't update context whose value is just set by user action

	// add contexts to ctxUpdateQueue

	const newQueue = _ctxUpdateQueue || new Set<ICtxUpdatable>();

	ctxs.forEach(ctx =>
	{
		if (ctx !== currentCtx)
		{
			newQueue.add(ctx);
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
function getCtx()
{
	const ctx = CtxScope.getCurrent();
	if (ctx == null) return null;

	return ctx.getParentUpdatableCtx();
}
function processQueue()
{
	const contexts = _ctxUpdateQueue;

	_timerId = undefined;
	_ctxUpdateQueue = null;

	if (contexts)
	{
		// collect into contextsToUpdate before ctx.update(), since parents will be set to null
		const contextsToUpdate: ICtxUpdatable[] = [];

		contexts.forEach(ctx =>
		{
			if (!ctx.isAnyParentInList(contexts))
			{
				contextsToUpdate.push(ctx);
			}
		});

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
export function applyChanges()
{
	console.log('applyChanges', '_timerId', _timerId, _ctxUpdateQueue, _updatedCbs.length);

	clearTimeout(_timerId);
	_timerId = undefined;

	processQueue();
}
