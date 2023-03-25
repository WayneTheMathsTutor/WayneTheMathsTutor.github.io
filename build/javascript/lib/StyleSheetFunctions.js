export function getStyleSheet(href) {
	let styleSheets = document.styleSheets;
	for (let i = 0; i < styleSheets.length; ++i) {
		if (styleSheets[i].href.endsWith(href)) {
			return styleSheets[i];
		}
	}
	return null;
}

export function findRule(href, selectorText) {
	let styleSheetRules = getStyleSheet(href).cssRules;
	for (let i = 0; i < styleSheetRules.length; ++i) {
		if (styleSheetRules[i].selectorText === selectorText) {
			return styleSheetRules[i];
		}
	}
	return null;
}

export function setValue(href, selectorText, propertyName, val) {
	let rule = findRule(href, selectorText);
	if (rule == null) { return null; }
	rule.style.setProperty(propertyName, val);
	return val;
}

export function toggleValue(href, selectorText, propertyName, defaultVal, alternateVal) {
	let rule = findRule(href, selectorText);
	if (rule == null) { return null; }

	let ret = defaultVal;
	if (rule.style.getPropertyValue(propertyName) == defaultVal) {
		ret = alternateVal;
	}
	rule.style.setProperty(propertyName, ret);
	return ret;
}
