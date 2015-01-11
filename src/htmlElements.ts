module tsw.elements
{
	export class button extends elm
	{
		constructor()
		{
			super('button')
		}

		type(v: string): button
		{
			this.attr('type', v);

			return this;
		}
	}

	export class a extends elm
	{
		constructor()
		{
			super('a')
		}

		href(v: string): a
		{
			this.attr('href', v);

			return this;
		}
	}

	export class img extends elm
	{
		constructor()
		{
			super('img')
		}

		src(v: string): img
		{
			this.attr('src', v);

			return this;
		}
	}

	export class input extends elm
	{
		constructor()
		{
			super('input')
		}

		type(v: string): input
		{
			this.attr('type', v);

			return this;
		}

		checked(val: boolean): elm;
		checked(val: () => boolean): elm;
		checked(val: tsw.common.PropVal<boolean>): elm;
		checked(val: any): elm
		{
			this.attr('checked', val);
			return this;
		}

		placeholder(v: string): input
		{
			this.attr('placeholder', v);

			return this;
		}
	}

	export class label extends elm
	{
		constructor()
		{
			super('label')
		}

//		for_(v: string): label
//		{
//			this.attr('for', v);
//
//			return this;
//		}

		// TODO: label for
//		forRef(ref: tsw.elRefs.elementRef): label
//		{
//			this.attr('for', () => ref.getId());
//
//			return this;
//		}
	}
}
