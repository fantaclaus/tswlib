import { tswPropVal } from './PropVals';
import * as html from "./html";

export class tswRadioGroup<T>
{
	private propVal: tswPropVal<T>;
	private groupName?: string;
	private ids = new Map<T, string>();

	constructor(propVal: tswPropVal<T>, groupName?: string)
	{
		this.propVal = propVal;
		this.groupName = groupName;
	}
	radioButton(v: T, groupName?: string)
	{
		const p =
		{
			get: () => this.propVal.get() == v,
			set: () => this.propVal.set(v),
		};

		return html.inputRadio().value(p).attr('name', groupName || this.groupName).id(this.getId(v));
	}
	label(v: T)
	{
		return html.label().forId(this.getId(v));
	}
	private getId(v: T)
	{
		let id = this.ids.get(v);
		if (id == null)
		{
			id = this.getNextId();
			this.ids.set(v, id);
		}
		return id;
	}
	private getNextId()
	{
		return 'radioButton-' + Math.round((Math.random() * 1000));
	}
}