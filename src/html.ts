import { ElementGeneric } from './elm';
import * as elements from "./htmlElements";

export function nbsp() { return new elements.RawHtml("&nbsp;"); }
export function raw(s: string) { return new elements.RawHtml(s); }

export function el(tagName: string = '') { return new ElementGeneric(tagName); }

export function a() { return new elements.ElementA(); }
export function b() { return new ElementGeneric('b'); }
export function br() { return new ElementGeneric('br'); }
export function button() { return new elements.ElementButton(); }
export function div() { return new ElementGeneric('div'); }
export function form() { return new ElementGeneric('form'); }
export function h1() { return new ElementGeneric('h1'); }
export function h2() { return new ElementGeneric('h2'); }
export function h3() { return new ElementGeneric('h3'); }
export function h4() { return new ElementGeneric('h4'); }
export function h5() { return new ElementGeneric('h5'); }
export function h6() { return new ElementGeneric('h6'); }
export function hr() { return new ElementGeneric('hr'); }
export function i() { return new ElementGeneric('i'); }
export function img() { return new elements.ElementImg(); }
export function inputCheckBox() { return new elements.ElementInputCheckbox(); }
export function inputRadio() { return new elements.ElementInputRadio(); }
export function inputText() { return new elements.ElementInputText(); }
export function label() { return new elements.ElementLabel(); }
export function li() { return new ElementGeneric('li'); }
export function nav() { return new ElementGeneric('nav'); }
export function option() { return new elements.ElementOption(); }
export function p() { return new ElementGeneric('p'); }
export function pre() { return new ElementGeneric('pre'); }
export function select() { return new elements.ElementSelect(); }
export function selectByIndex() { return new elements.ElementSelectByIndex(); }
export function small() { return new ElementGeneric('small'); }
export function span() { return new ElementGeneric('span'); }
export function table() { return new ElementGeneric('table'); }
export function tbody() { return new ElementGeneric('tbody'); }
export function td() { return new elements.ElementTD('td'); }
export function textArea() { return new elements.ElementTextArea(); }
export function th() { return new elements.ElementTD('th'); }
export function thead() { return new ElementGeneric('thead'); }
export function tr() { return new ElementGeneric('tr'); }
export function ul() { return new ElementGeneric('ul'); }
