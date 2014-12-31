module tsw.html
{
	export function nbsp(): elements.rawHtml
	{
		return new elements.rawHtml("&nbsp;");
	}
	export function raw(s: string): elements.rawHtml
	{
		return new elements.rawHtml(s);
	}
	export function el(tagName: string): elements.elm
	{
		return new elements.elm(tagName);
	}

	export function div(): elements.elm
	{
		return new elements.elm('div');
	}

	export function p(): elements.elm
	{
		return new elements.elm('p');
	}

	export function span(): elements.elm
	{
		return new elements.elm('span');
	}

	export function h1(): elements.elm
	{
		return new elements.elm('h1');
	}

	export function h2(): elements.elm
	{
		return new elements.elm('h2');
	}

	export function h3(): elements.elm
	{
		return new elements.elm('h3');
	}

	export function h4(): elements.elm
	{
		return new elements.elm('h4');
	}

	export function small(): elements.elm
	{
		return new elements.elm('small');
	}

	export function a(): elements.a
	{
		return new elements.a();
	}

	export function nav(): elements.elm
	{
		return new elements.elm('nav');
	}

	export function br(): elements.elm
	{
		return new elements.elm('br');
	}

	export function hr(): elements.elm
	{
		return new elements.elm('hr');
	}

	export function button(): elements.button
	{
		return new elements.button();
	}

	export function ul(): elements.elm
	{
		return new elements.elm('ul');
	}

	export function li(): elements.elm
	{
		return new elements.elm('li');
	}

	export function i(): elements.elm
	{
		return new elements.elm('i');
	}

	export function img(): elements.img
	{
		return new elements.img();
	}

	export function form(): elements.elm
	{
		return new elements.elm('form');
	}

	export function table(): elements.elm
	{
		return new elements.elm('table');
	}

	export function thead(): elements.elm
	{
		return new elements.elm('thead');
	}

	export function tbody(): elements.elm
	{
		return new elements.elm('tbody');
	}

	export function tr(): elements.elm
	{
		return new elements.elm('tr');
	}

	export function th(): elements.elm
	{
		return new elements.elm('th');
	}

	export function td(): elements.elm
	{
		return new elements.elm('td');
	}

	export function label(): elements.label
	{
		return new elements.label();
	}

	export function input(): elements.input
	{
		return new elements.input();
	}
}
