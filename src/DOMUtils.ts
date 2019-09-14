import { HtmlBlockMarkers } from "./HtmlBlockMarkers";

let _isIE9: boolean | undefined;
let _tmpHtmlElement: HTMLElement;

function isIE9()
{
	if (_isIE9 === undefined) _isIE9 = (/MSIE 9\.0/i).test(navigator.userAgent);
	return _isIE9;
}

export function updateInnerHtml(targetElement: HTMLElement, id: string, html: string)
{
	const markers = new HtmlBlockMarkers(id);

	// TBODY must be defined explicitly in onRender() of a control
	// otherwise commented section will not be found, since targetElement would be TABLE

	const COMMENT_NODE = 8; // on IE8 Node is undefined

	let nodeBeginMarker: Node | null = null;
	let nodeEndMarker: Node | null = null;
	let isFirst = false;
	let isLast = false;

	if (targetElement.hasChildNodes())
	{
		const firstNode = targetElement.firstChild!;
		if (firstNode.nodeType == COMMENT_NODE && firstNode.nodeValue == markers.begin)
		{
			nodeBeginMarker = firstNode;
			isFirst = true;
		}

		const lastNode = targetElement.lastChild!;
		if (lastNode.nodeType == COMMENT_NODE && lastNode.nodeValue == markers.end)
		{
			nodeEndMarker = lastNode;
			isLast = true;
		}

		if (!isFirst || !isLast)
		{
			let node: Node | null = firstNode;

			while (node)
			{
				if (node.nodeType == COMMENT_NODE)
				{
					if (node.nodeValue == markers.begin)
					{
						nodeBeginMarker = node;
					}
					else if (node.nodeValue == markers.end)
					{
						nodeEndMarker = node;
					}
				}

				node = node.nextSibling;
			}

			if (!nodeBeginMarker && nodeEndMarker)
			{
				// IE 8 removes all comments in the beginning of innerHTML
				nodeBeginMarker = firstNode;
				isFirst = true;
			}
		}
	}

	// const foundBothMarkers = nodeBeginMarker && nodeEndMarker;
	// const foundNoMarkers = !nodeBeginMarker && !nodeEndMarker;

	const tagName = targetElement.tagName;
	const isReadOnly = (tagName == 'TABLE' || tagName == 'TBODY' || tagName == 'THEAD' || tagName == 'TFOOT' || tagName == 'TR') && isIE9();

	if ((isFirst && isLast) || (!nodeBeginMarker && !nodeEndMarker))
	{
		const html2 = markers.getHtml(html);

		if (isReadOnly)
		{
			while (targetElement.firstChild)
			{
				targetElement.removeChild(targetElement.firstChild);
			}

			// can not use table since its innerHTML in IE9 is r/o
			if (!_tmpHtmlElement) _tmpHtmlElement = document.createElement('div');

			insertNodes(targetElement, html2, null);
		}
		else
		{
			targetElement.innerHTML = html2;
		}
	}
	else
	{
		// replace between markers

		if (nodeBeginMarker && nodeEndMarker)
		{
			let node = nodeBeginMarker.nextSibling!;

			while (node !== nodeEndMarker)
			{
				const nodeNext = node.nextSibling!;

				targetElement.removeChild(node);

				node = nodeNext;
			}

			if (!_tmpHtmlElement) _tmpHtmlElement = document.createElement('div');

			let html2 = html;

			if (isIE9())
			{
				// IE9 needs something between a comment and a tag
				if (isFirst) html2 = "\n" + html2;
				if (isLast) html2 = html2 + "\n";
			}

			if (isReadOnly)
			{
				insertNodes(targetElement, html2, nodeEndMarker);
			}
			else
			{
				targetElement.insertBefore(_tmpHtmlElement, nodeEndMarker);
				_tmpHtmlElement.insertAdjacentHTML('beforebegin', html2);
				targetElement.removeChild(_tmpHtmlElement);
			}

			// doesn't work on IE
			// const tmp = document.createElement('template');
			// tmp.innerHTML = html;
			// targetElement.insertBefore(tmp.content, nodeEndMarker);
		}
	}
}

function insertNodes(targetElement: Element, html2: string, insertBefore: Node | null)
{
	const tagName = targetElement.tagName;

	let node: Node | null;

	switch (tagName)
	{
		case 'TR':
			_tmpHtmlElement.innerHTML = `<TABLE><TBODY><TR>${html2}</TR></BODY></TABLE>`;
			node = _tmpHtmlElement.firstChild!.firstChild!.firstChild!.firstChild;
			break;
		case 'THEAD':
		case 'TBODY':
		case 'TFOOT':
			_tmpHtmlElement.innerHTML = `<TABLE><TBODY>${html2}</BODY></TABLE>`;
			node = _tmpHtmlElement.firstChild!.firstChild!.firstChild;
			break;
		case 'TABLE':
			_tmpHtmlElement.innerHTML = `<TABLE>${html2}</TABLE>`;
			node = _tmpHtmlElement.firstChild!.firstChild;
			break;
		default:
			throw new Error(`Unexpected tagName=${tagName}`);
	}

	while (node)
	{
		const nextSib = node.nextSibling;
		targetElement.insertBefore(node, insertBefore);
		node = nextSib;
	}

	_tmpHtmlElement.innerHTML = '';
}
