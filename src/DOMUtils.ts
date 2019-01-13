import { HtmlBlockMarkers } from "./HtmlBlockMarkers";

let _tmpHtmlElement: HTMLElement;

export function updateInnerHtml(targetElement: HTMLElement, id: string, html: string)
{
	const markers = new HtmlBlockMarkers(id);

	// TODO: remove native event handlers (?)

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

			while (node && (!nodeBeginMarker || !nodeEndMarker))
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

	if ((isFirst && isLast) || (!nodeBeginMarker && !nodeEndMarker))
	{
		targetElement.innerHTML = markers.getHtml(html);
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

			if (!_tmpHtmlElement)
			{
				_tmpHtmlElement = document.createElement('span');
				_tmpHtmlElement.style.display = "none"; // slightly improves performance
			}

			let html2 = html;

			// IE9 needs something between a comment and a tag
			// if (isFirst) html2 = "\n" + html2;
			// if (isLast) html2 = html2 + "\n";

			// insert html into TABLE doesn't work on IE<10
			targetElement.insertBefore(_tmpHtmlElement, nodeEndMarker);
			_tmpHtmlElement.insertAdjacentHTML('beforebegin', html2);
			targetElement.removeChild(_tmpHtmlElement);

			// doesn't work on IE
			// const tmp = document.createElement('template');
			// tmp.innerHTML = html;
			// targetElement.insertBefore(tmp.content, nodeEndMarker);
		}
	}
}