Overview
========

This library can be used to create client-side web applications.
All rendering of HTML is done entirely in the Typescript code.
The library has no dependecies.

Example
========

This is an example of a very simple script which displays a list of text items:

```typescript
const items = ["item 1", "item 2", "item 3"];

const content =
	tsw.html.ul().children([
		items.map(item => tsw.html.li().children(item)),
	]);

tsw.setContent(document.body, content);
```
