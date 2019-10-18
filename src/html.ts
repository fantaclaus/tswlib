import { tswElement } from './elm';
import * as elements from "./htmlElements";

export function nbsp() { return '\xA0'; }
export function raw(s: string) { return new elements.tswRawHtml(s); }

export function el(tagName: string = '') { return new tswElement(tagName); }

export function a() { return new elements.tswElementA(); }
export function b() { return new tswElement('b'); }
export function br() { return new tswElement('br'); }
export function button() { return new elements.tswElementButton(); }
export function div() { return new tswElement('div'); }
export function form() { return new tswElement('form'); }
export function h1() { return new tswElement('h1'); }
export function h2() { return new tswElement('h2'); }
export function h3() { return new tswElement('h3'); }
export function h4() { return new tswElement('h4'); }
export function h5() { return new tswElement('h5'); }
export function h6() { return new tswElement('h6'); }
export function hr() { return new tswElement('hr'); }
export function i() { return new tswElement('i'); }
export function img() { return new elements.tswElementImg(); }
export function inputCheckBox() { return new elements.tswElementInputCheckbox(); }
export function inputRadio() { return new elements.tswElementInputRadio(); }
export function inputText() { return new elements.tswElementInputText(); }
export function label() { return new elements.tswElementLabel(); }
export function li() { return new tswElement('li'); }
export function nav() { return new tswElement('nav'); }
export function option() { return new elements.tswElementOption(); }
export function p() { return new tswElement('p'); }
export function pre() { return new tswElement('pre'); }
export function select() { return new elements.tswElementSelect(); }
export function small() { return new tswElement('small'); }
export function span() { return new tswElement('span'); }
export function table() { return new tswElement('table'); }
export function tbody() { return new tswElement('tbody'); }
export function td() { return new elements.tswElementTD('td'); }
export function textArea() { return new elements.tswElementTextArea(); }
export function th() { return new elements.tswElementTD('th'); }
export function thead() { return new tswElement('thead'); }
export function tfoot() { return new tswElement('tfoot'); }
export function tr() { return new tswElement('tr'); }
export function ul() { return new tswElement('ul'); }
