module tsw.html
{
	export function nbsp(): elements.rawHtml
	{
		return new elements.rawHtml("&nbsp;");
	}
	export function rawHtml(s: string): elements.rawHtml
	{
		return new elements.rawHtml(s);
	}
	export function el(tagName: string): elements.el
	{
		return new elements.el(tagName);
	}

	export function div(): elements.el
	{
		return new elements.el('div');
	}

	export function p(): elements.el
	{
		return new elements.el('p');
	}

	export function span(): elements.el
	{
		return new elements.el('span');
	}

	export function h1(): elements.el
	{
		return new elements.el('h1');
	}

	export function h2(): elements.el
	{
		return new elements.el('h2');
	}

	export function h3(): elements.el
	{
		return new elements.el('h3');
	}

	export function h4(): elements.el
	{
		return new elements.el('h4');
	}

	export function small(): elements.el
	{
		return new elements.el('small');
	}

	export function a(): elements.a
	{
		return new elements.a();
	}

	export function nav(): elements.el
	{
		return new elements.el('nav');
	}

	export function br(): elements.el
	{
		return new elements.el('br');
	}

	export function hr(): elements.el
	{
		return new elements.el('hr');
	}

	export function button(): elements.button
	{
		return new elements.button();
	}

	export function ul(): elements.el
	{
		return new elements.el('ul');
	}

	export function li(): elements.el
	{
		return new elements.el('li');
	}

	export function i(): elements.el
	{
		return new elements.el('i');
	}

	export function img(): elements.img
	{
		return new elements.img();
	}

	export function form(): elements.el
	{
		return new elements.el('form');
	}

	export function table(): elements.el
	{
		return new elements.el('table');
	}

	export function thead(): elements.el
	{
		return new elements.el('thead');
	}

	export function tbody(): elements.el
	{
		return new elements.el('tbody');
	}

	export function tr(): elements.el
	{
		return new elements.el('tr');
	}

	export function th(): elements.el
	{
		return new elements.el('th');
	}

	export function td(): elements.el
	{
		return new elements.el('td');
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
