import { Ctx } from "./Ctx";
import { attrValTypeInternal2, StyleRule, singleStringValType } from "./types";
import { PropDefReadable } from "./PropDefs";
import { Scope } from "./CtxScope";

export class CtxAttr extends Ctx
{
	constructor(private el: HTMLElement, private attrName: string, private attrVals: attrValTypeInternal2)
	{
		super();
	}
	update()
	{
		this.detachPropVals();

		Scope.use(this, () =>
		{
			this.setAttrVal();
		});

		if (this.hasPropVals())
		{
			const ctxParent = Scope.getCurrent();
			if (ctxParent) ctxParent.addChild(this);

			console.debug(`CtxAttr.update("${this.attrName}"=`, this.attrVals, ') for ', this.el, 'ctx:', this);
		}
	}
	private setAttrVal()
	{
		let result: string | null = null;

		const isMultiValueType = this.attrName == "class" || this.attrName == "style";
		const separator = this.attrName == "class" ? ' ' : this.attrName == "style" ? ';' : null;

		addAttrString(this.attrVals);

		if (result != null) this.el.setAttribute(this.attrName, result);

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
			else if (attrValue instanceof StyleRule)
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
