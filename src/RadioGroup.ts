import { PropVal } from './PropVals';
import * as elements from './htmlElements';
import { Ref } from './Ref';

export class RadioGroup<T>
{
	private propVal: PropVal<T>;
	private groupName: string;
	private refs: { key: T; ref: Ref }[] = [];

	constructor(propVal: PropVal<T>, groupName: string)
	{
		this.propVal = propVal;
		this.groupName = groupName;
	}
	item(v: T): elements.ElementInputRadio
	{
		var p =
			{
				get: () => this.propVal.get() == v,
				set: () => this.propVal.set(v),
			};

		var elm = new elements.ElementInputRadio();
		elm.value(p).attr('name', this.groupName).addRef(this.getRefFor(v));
		return elm;
	}
	label(v: T): elements.ElementLabel
	{
		var elm = new elements.ElementLabel();
		elm.forRef(this.getRefFor(v));
		return elm;
	}
	private getRefFor(v: T): Ref
	{
		var keyRef = this.refs.find(kr => kr.key == v);
		if (keyRef == null)
		{
			keyRef = { key: v, ref: new Ref() };
			this.refs.push(keyRef);
		}
		return keyRef.ref;
	}
}