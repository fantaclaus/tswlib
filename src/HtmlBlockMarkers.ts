export class HtmlBlockMarkers
{
	begin: string;
	end: string;

	constructor(id: string)
	{
		this.begin = `B:${id}`;
		this.end = `E:${id}`;
	}
	
	getHtml(html: string)
	{
		return `<!--${this.begin}-->${html}<!--${this.end}-->`;
	}
}
