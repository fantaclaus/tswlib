import { CtxUtils } from './CtxUtils';
import { PropDef } from './propDefs';

export class Ref implements PropDef<string>
{
	private refId: string;

	get(): string
	{
		CtxUtils.attach(this);

		return this.refId;
	}
	set(v: string): void
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
