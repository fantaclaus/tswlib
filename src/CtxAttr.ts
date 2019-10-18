import { tswCtx } from "./Ctx";
import { attrValTypeInternal2, singleStringValType, PropDefReadable } from "./types";
import { g_CurrentContext } from "./Scope";
import { tswStyleRule } from "./elm";

export class tswCtxAttr extends tswCtx
{
	constructor(private el: Element, private attrName: string, private attrVals: attrValTypeInternal2)
	{
		super();
	}
	setup(ctxParent: tswCtx)
	{
		this.setAttrVal();

		this.addCtxToParent(ctxParent);
	}
	update()
	{
		if (this.ctxParent === null) return;

		this.removeChildren();

		this.setAttrVal();
	}
	private setAttrVal()
	{
		g_CurrentContext.use(this, () => this._setAttrVal());
	}
	private _setAttrVal()
	{
		let result: string | null = null;

		const isMultiValueType = this.attrName == "class" || this.attrName == "style";
		const separator = this.attrName == "class" ? ' ' : this.attrName == "style" ? ';' : null;

		addAttrString(this.attrVals);

		if (result != null)
		{
			this.el.setAttribute(this.attrName, result);
		}
		else
		{
			this.el.removeAttribute(this.attrName);
		}

		function addAttrString(attrValue: attrValTypeInternal2)
		{
			if (attrValue == null || attrValue === false)
			{
				// single: remove attr
				// multi: not added
				if (!isMultiValueType) result = null;
			}
			else if (typeof attrValue == "string")
			{
				// single: set attr val
				// multi: add separated with separator
				if (isMultiValueType)
				{
					if (attrValue)
					{
						if (result)
						{
							result += separator;
							result += attrValue;
						}
						else
						{
							result = attrValue;
						}
					}
				}
				else
				{
					result = attrValue;
				}
			}
			else if (attrValue instanceof tswStyleRule)
			{
				if (attrValue.propName)
				{
					const ruleValue = getRuleValue(attrValue.propValue);
					if (ruleValue) addAttrString(attrValue.propName + ':' + ruleValue);
				}
			}
			else if (attrValue === true)
			{
				addAttrString('');
			}
			else if (attrValue instanceof Array)
			{
				attrValue.forEach(v => addAttrString(v));
			}
			else if (attrValue instanceof Function)
			{
				const v = attrValue();
				addAttrString(v);
			}
			else if (isPropDefReadable<any>(attrValue))
			{
				const v = attrValue.get();
				addAttrString(v);
			}
			else
			{
				addAttrString(attrValue.toString());
			}
		}
	}
	get dbg_attrName() { return this.attrName; }
	get dbg_el() { return this.el; }
}


function getRuleValue(s: singleStringValType)
{
	if (s instanceof Function)
	{
		const v = s();
		return v;
	}
	else if (isPropDefReadable(s))
	{
		const v = s.get();
		return v;
	}
	else
	{
		return s;
	}
}
function isPropDefReadable<T>(v: any): v is PropDefReadable<T>
{
	return v && v.get instanceof Function;
}
