namespace tsw.elements
{
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
		item(v: T)
		{
			const p =
				{
					get: () => this.propVal.get() == v,
					set: () => this.propVal.set(v),
				};

			const elm = new ElementInputRadio();
			elm.value(p).attr('name', this.groupName).addRef(this.getRefFor(v));
			return elm;
		}
		label(v: T)
		{
			const elm = new ElementLabel();
			elm.forRef(this.getRefFor(v));
			return elm;
		}
		private getRefFor(v: T)
		{
			let keyRef = this.refs.find(kr => kr.key == v);
			if (keyRef == null)
			{
				keyRef = { key: v, ref: new Ref() };
				this.refs.push(keyRef);
			}
			return keyRef.ref;
		}
	}
}