/// <reference path="el.ts" />

module tsw.elements
{
	export class button extends el
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

	export class a extends el
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
		//onclick(handler: JQueryEventHandler): el
		//{
		//	return super.onclick(e =>
		//	{
		//		e.preventDefault();

		//		handler(e);
		//	});
		//}
	}

	export class img extends el
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

	export class input extends el
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

		placeholder(v: string): input
		{
			this.attr('placeholder', v);

			return this;
		}
	}

	export class label extends el
	{
		constructor()
		{
			super('label')
		}

		for_(v: string): label
		{
			this.attr('for', v);

			return this;
		}
	}
}
