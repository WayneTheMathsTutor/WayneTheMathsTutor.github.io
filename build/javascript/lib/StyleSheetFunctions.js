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

export class CssValue {
	cssStyleDeclaration;
	propertyName;

	setValue(val) {
		this.cssStyleDeclaration.setProperty(this.propertyName, val);
	}

	constructor(href, selectorText, propertyName) {
		this.cssStyleDeclaration = findRule(href, selectorText).style;
		this.propertyName = propertyName
	}
}

export class CssToggleValue extends CssValue {
	#valArr;

	setValueIndex(index) {
		this.cssStyleDeclaration.setProperty(this.propertyName, this.#valArr[index]);
	}
	open = this.setValueIndex.bind(this, 1);
	close = this.setValueIndex.bind(this, 0);

	toggle() {
		let destVal = this.#valArr[0];
		if (this.cssStyleDeclaration.getPropertyValue(this.propertyName) == destVal) {
			destVal = this.#valArr[1];
		}
		this.cssStyleDeclaration.setProperty(this.propertyName, destVal);
	}

	constructor(href, selectorText, propertyName, inputValArray) {
		super(href, selectorText, propertyName);
		this.#valArr = inputValArray;
	}
};
