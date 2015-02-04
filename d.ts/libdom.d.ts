/* *****************************************************************************
 this is an excerpt of lib.d.ts supplied with the typescript compiler
 modified by fantaclaus
 all unused definitions were removed to increase the compilation speed
 ***************************************************************************** */

interface NodeList {
	length: number;
	item(index: number): Node;
	[index: number]: Node;
}

interface Node extends EventTarget {
	firstChild: Node;
	lastChild: Node;
	nextSibling: Node;
	parentNode: Node;
	nodeType: number;
	nodeValue: string;
	hasChildNodes(): boolean;
	removeChild(oldChild: Node): Node;
}

declare var Node: {
	prototype: Node;
	new (): Node;
	ENTITY_REFERENCE_NODE: number;
	ATTRIBUTE_NODE: number;
	DOCUMENT_FRAGMENT_NODE: number;
	TEXT_NODE: number;
	ELEMENT_NODE: number;
	COMMENT_NODE: number;
	DOCUMENT_POSITION_DISCONNECTED: number;
	DOCUMENT_POSITION_CONTAINED_BY: number;
	DOCUMENT_POSITION_CONTAINS: number;
	DOCUMENT_TYPE_NODE: number;
	DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: number;
	DOCUMENT_NODE: number;
	ENTITY_NODE: number;
	PROCESSING_INSTRUCTION_NODE: number;
	CDATA_SECTION_NODE: number;
	NOTATION_NODE: number;
	DOCUMENT_POSITION_FOLLOWING: number;
	DOCUMENT_POSITION_PRECEDING: number;
};

interface Element extends Node, NodeSelector {
	tagName: string;
}

interface HTMLElement extends Element {
	id: string;
	innerHTML: string;
	insertBefore(newChild: Node, refChild?: Node): Node;
	insertAdjacentHTML(where: string, html: string): void;
	parentElement: HTMLElement;
}

interface NodeSelector {
	querySelectorAll(selectors: string): NodeList;
	querySelector(selectors: string): Element;
}

interface Document extends NodeSelector {
	title: string;
	body: HTMLElement;
	getElementById(elementId: string): HTMLElement;
	createElement(tagName: string): HTMLElement;
}

interface XMLDocument {

}

interface WindowTimers {
	clearTimeout(handle: number): void;
	setTimeout(handler: any, timeout?: any, ...args: any[]): number;
	clearInterval(handle: number): void;
	setInterval(handler: any, timeout?: any, ...args: any[]): number;
}

interface Window extends WindowTimers {
	console: Console;
	location: Location;
}

interface Location
{
	hash: string;
	protocol: string;
	search: string;
	href: string;
	hostname: string;
	port: string;
	pathname: string;
	host: string;
	reload(flag?: boolean): void;
	replace(url: string): void;
	assign(url: string): void;
	toString(): string;
}

interface Console {
	log(message?: any, ...optionalParams: any[]): void;
	info(message?: any, ...optionalParams: any[]): void;
	error(message?: any, ...optionalParams: any[]): void;
	warn(message?: any, ...optionalParams: any[]): void;
	debug(message?: any, ...optionalParams: any[]): void;
	trace(...optionalParams: any[]): void;
	dir(value: any): void;
	group(message: any, ...optionalParams: any[]): void;
	groupCollapsed(message: any, ...optionalParams: any[]): void;
	groupEnd(): void;
}

interface Event {
	timeStamp: number;
	defaultPrevented: boolean;
	isTrusted: boolean;
	currentTarget: EventTarget;
	cancelBubble: boolean;
	target: EventTarget;
	eventPhase: number;
	cancelable: boolean;
	type: string;
	srcElement: Element;
	bubbles: boolean;
	initEvent(eventTypeArg: string, canBubbleArg: boolean, cancelableArg: boolean): void;
	stopPropagation(): void;
	stopImmediatePropagation(): void;
	preventDefault(): void;
	CAPTURING_PHASE: number;
	AT_TARGET: number;
	BUBBLING_PHASE: number;
}

interface PopStateEvent extends Event {
	state: any;
	initPopStateEvent(typeArg: string, canBubbleArg: boolean, cancelableArg: boolean, stateArg: any): void;
}

interface EventListener {
	(evt: Event): void;
}

interface EventTarget {
	addEventListener(type: string, listener: EventListener, useCapture?: boolean): void;
	removeEventListener(type: string, listener: EventListener, useCapture?: boolean): void;
	dispatchEvent(evt: Event): boolean;
}

interface XMLHttpRequest extends EventTarget {
	responseBody: any;
	status: number;
	readyState: number;
	responseText: string;
	responseXML: Document;
	ontimeout: (ev: Event) => any;
	statusText: string;
	onreadystatechange: (ev: Event) => any;
	timeout: number;
	onload: (ev: Event) => any;
	open(method: string, url: string, async?: boolean, user?: string, password?: string): void;
	send(data?: any): void;
	abort(): void;
	getAllResponseHeaders(): string;
	setRequestHeader(header: string, value: string): void;
	getResponseHeader(header: string): string;
	LOADING: number;
	DONE: number;
	UNSENT: number;
	OPENED: number;
	HEADERS_RECEIVED: number;
}

declare var XMLHttpRequest: {
	prototype: XMLHttpRequest;
	new (): XMLHttpRequest;
	LOADING: number;
	DONE: number;
	UNSENT: number;
	OPENED: number;
	HEADERS_RECEIVED: number;
	create(): XMLHttpRequest;
}

declare var document: Document;
declare var window: Window;
declare var console: Console;

declare function alert(message?: any): void;
