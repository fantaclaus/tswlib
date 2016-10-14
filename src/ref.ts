import * as CtxUtils from './CtxUtils';
import { PropDef } from './propDefs';

export class Ref implements PropDef<string | null>
{
	private refId: string | null;

	get(): string | null
	{
		CtxUtils.attach(this);

		return this.refId;
	}
	set(v: string | null): void
	{
		if (this.refId !== v)
		{
			//console.group('ref %s %o: set value %o', this.name, this, v);

			this.refId = v;

			CtxUtils.update(this);

			//console.groupEnd();
		}
	}

	asJQuery(): JQuery
	{
		return jQuery('#' + this.refId);
	}
}
