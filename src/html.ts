module tsw.html
{
	export function nbsp() { return new elements.RawHtml("&nbsp;"); }
	export function raw(s: string) { return new elements.RawHtml(s); }
	
	export function el(tagName: string = '') { return new elements.ElementGeneric(tagName); }

	export function a() { return new elements.ElementA(); }
	export function b() { return new elements.ElementGeneric('b'); }
	export function br() { return new elements.ElementGeneric('br'); }
	export function button() { return new elements.ElementButton(); }
	export function div() { return new elements.ElementGeneric('div'); }
	export function form() { return new elements.ElementGeneric('form'); }
	export function h1() { return new elements.ElementGeneric('h1'); }
	export function h2() { return new elements.ElementGeneric('h2'); }
	export function h3() { return new elements.ElementGeneric('h3'); }
	export function h4() { return new elements.ElementGeneric('h4'); }
	export function h5() { return new elements.ElementGeneric('h5'); }
	export function h6() { return new elements.ElementGeneric('h6'); }
	export function hr() { return new elements.ElementGeneric('hr'); }
	export function i() { return new elements.ElementGeneric('i'); }
	export function img() { return new elements.ElementImg(); }
	export function inputCheckBox() { return new elements.ElementInputCheckbox(); }
	export function inputRadio() { return new elements.ElementInputRadio(); }
	export function inputText() { return new elements.ElementInputText(); }
	export function label() { return new elements.ElementLabel(); }
	export function li() { return new elements.ElementGeneric('li'); }
	export function nav() { return new elements.ElementGeneric('nav'); }
	export function option() { return new elements.ElementOption(); }
	export function p() { return new elements.ElementGeneric('p'); }
	export function pre() { return new elements.ElementGeneric('pre'); }
	export function select() { return new elements.ElementSelect(); }
	export function small() { return new elements.ElementGeneric('small'); }
	export function span() { return new elements.ElementGeneric('span'); }
	export function table() { return new elements.ElementGeneric('table'); }
	export function tbody() { return new elements.ElementGeneric('tbody'); }
	export function td() { return new elements.ElementGeneric('td'); }
	export function textArea() { return new elements.ElementTextArea(); }
	export function th() { return new elements.ElementGeneric('th'); }
	export function thead() { return new elements.ElementGeneric('thead'); }
	export function tr() { return new elements.ElementGeneric('tr'); }
	export function ul() { return new elements.ElementGeneric('ul'); }
}
