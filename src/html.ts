module tsw.html
{
	export function nbsp(): elements.RawHtml
	{
		return new elements.RawHtml("&nbsp;");
	}
	export function raw(s: string): elements.RawHtml
	{
		return new elements.RawHtml(s);
	}
	export function el(tagName: string = ''): elements.Element
	{
		return new elements.Element(tagName);
	}
	export function div(): elements.Element
	{
		return new elements.Element('div');
	}
	export function p(): elements.Element
	{
		return new elements.Element('p');
	}
	export function span(): elements.Element
	{
		return new elements.Element('span');
	}
	export function b(): elements.Element
	{
		return new elements.Element('b');
	}
	export function i(): elements.Element
	{
		return new elements.Element('i');
	}
	export function h1(): elements.Element
	{
		return new elements.Element('h1');
	}
	export function h2(): elements.Element
	{
		return new elements.Element('h2');
	}
	export function h3(): elements.Element
	{
		return new elements.Element('h3');
	}
	export function h4(): elements.Element
	{
		return new elements.Element('h4');
	}
	export function small(): elements.Element
	{
		return new elements.Element('small');
	}
	export function a(): elements.ElementA
	{
		return new elements.ElementA();
	}
	export function nav(): elements.Element
	{
		return new elements.Element('nav');
	}
	export function br(): elements.Element
	{
		return new elements.Element('br');
	}
	export function hr(): elements.Element
	{
		return new elements.Element('hr');
	}
	export function button(): elements.ElementButton
	{
		return new elements.ElementButton();
	}
	export function ul(): elements.Element
	{
		return new elements.Element('ul');
	}
	export function li(): elements.Element
	{
		return new elements.Element('li');
	}
	export function img(): elements.ElementImg
	{
		return new elements.ElementImg();
	}
	export function form(): elements.Element
	{
		return new elements.Element('form');
	}
	export function table(): elements.Element
	{
		return new elements.Element('table');
	}
	export function thead(): elements.Element
	{
		return new elements.Element('thead');
	}
	export function tbody(): elements.Element
	{
		return new elements.Element('tbody');
	}
	export function tr(): elements.Element
	{
		return new elements.Element('tr');
	}
	export function th(): elements.Element
	{
		return new elements.Element('th');
	}
	export function td(): elements.Element
	{
		return new elements.Element('td');
	}
	export function label(): elements.ElementLabel
	{
		return new elements.ElementLabel();
	}
	export function inputText(): elements.ElementInputText
	{
		return new elements.ElementInputText();
	}
	export function inputCheckBox(): elements.ElementInputCheckbox
	{
		return new elements.ElementInputCheckbox();
	}
	export function inputRadio(): elements.ElementInputRadio
	{
		return new elements.ElementInputRadio();
	}
	export function select(): elements.ElementSelect
	{
		return new elements.ElementSelect();
	}
	export function option(): elements.ElementOption
	{
		return new elements.ElementOption();
	}
	export function textArea(): elements.ElementTextArea
	{
		return new elements.ElementTextArea();
	}
}
