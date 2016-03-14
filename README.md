Overview
========

This library can be used to create client-side web applications. All rendering of HTML is
done entirely in the Typescript code. There are no templates, embedded expressions etc.

This is an example of a very simple script which displays a list of text items:

```typescript
let items = ["item 1", "item 2", "item 3"];

let content =
	tsw.html.ul().children([
		items.map(item => tsw.html.li().children(item)),
	]);

tsw.setContent(document.body, content);
```

The library internally uses jQuery, so you have to load it in your html file.
