import { ICtx } from "./types";
import { log, logCtx, logcolor } from "lib/dbgutils";
// import * as dbgutils from "lib/dbgutils";

let _updateQueue: Set<ICtx> | null = null;
let _timerId: number | undefined;
let _updatedCbs: (() => void)[] = [];

export function addToUpdateQueue(ctxs: Set<ICtx>)
{
	ctxs.forEach(ctx =>
	{
		log(console.debug, `add to queue `, logCtx(ctx));
	});

	if (_updateQueue == null)
	{
		_updateQueue = ctxs;
	}
	else
	{
		const updateQueue = _updateQueue;
		ctxs.forEach(ctx =>
		{
			updateQueue.add(ctx);
		});
	}

	if (_updateQueue.size > 0 && _timerId == null)
	{
		_timerId = setTimeout(processQueue, 0);
	}
}

export function removeFromUpdateQueue(ctx: ICtx)
{
	if (_updateQueue)
	{
		log(console.debug, logcolor("orange"), `CTX: removeFromUpdateQueue `, logCtx(ctx));
		_updateQueue.delete(ctx);
	}
}

function processQueue()
{
	const updateQueue = _updateQueue;

	_timerId = undefined;
	_updateQueue = null;

	if (updateQueue)
	{
		// console.debug(`processQueue: size=${updateQueue.size}; begin`);

		if (updateQueue.size == 1)
		{
			// log(console.debug, logcolor('red'), `processQueue: contextsToUpdate.length=${updateQueue.size}; begin`);

			updateQueue.forEach(ctx =>
			{
				// log(console.debug, logcolor('red'), `UpdateQueue: update ctx `, logCtx(ctx));
				ctx.update();
			});
		}
		else
		{
			// collect into contextsToUpdate before ctx.update(), since parents will be set to null

			// const t0 = performance.now();
			const contextsToUpdate = getContextsToUpdate(updateQueue);
			//const contextsToUpdate = Array.from(updateQueue);

			// log(console.debug, logcolor('red'), `processQueue: contextsToUpdate.length=${contextsToUpdate.length}; begin`);

			// const t1 = performance.now();
			// log(console.debug, `processQueue: getContextsToUpdate elapsed: ${t1 - t0}`);

			// const logEnabled = dbgutils.options.logEnabled
			// dbgutils.options.logEnabled = false;

			for (let ctx of contextsToUpdate)
			{
				// while invoking ctx.update() some contexts could be removed,
				// so don't update removed contexts to avoid re-attaching them to propVals
				// if (ctx.getParent() == null)
				// {
				// 	log(console.debug, logcolor('red'), `UpdateQueue: skip update ctx `, logCtx(ctx));
				// }
				// else
				// {
					// log(console.debug, logcolor('red'), `UpdateQueue: update ctx `, logCtx(ctx));
					ctx.update();
				// }
			}

			// dbgutils.options.logEnabled = logEnabled;
		}

		// console.debug(`processQueue: end`);
	}

	const updatedCbs = _updatedCbs;
	_updatedCbs = [];

	for (let cb of updatedCbs)
	{
		cb();
	}
}

function getContextsToUpdate(updateQueue: Set<ICtx>)
{
	const contextsToUpdate: ICtx[] = [];

	updateQueue.forEach(ctx =>
	{
		if (!isAnyParentInQueue(ctx, updateQueue))
		{
			contextsToUpdate.push(ctx);
		}
	});

	return contextsToUpdate;
}
function isAnyParentInQueue(ctx: ICtx, updateQueue: Set<ICtx>)
{
	while (true)
	{
		const ctxParent = ctx.getParent();
		if (!ctxParent) return false;

		if (updateQueue.has(ctxParent)) return true;

		ctx = ctxParent;
	}
}

export function afterDOMUpdated(cb: () => void)
{
	if (_timerId != null)
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
	// log(console.debug, 'applyChanges', '_timerId', _timerId, _updateQueue, _updatedCbs.length);

	clearTimeout(_timerId);
	_timerId = undefined;

	processQueue();
}
