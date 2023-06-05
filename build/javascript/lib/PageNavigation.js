import {Hierarchy} from './Hierarchy.js'
import {Path} from './Path.js'

export class PageData {
	static defaultPageDataLoadFunc;

	hierarchyNode = null;
	#systematicPath = null;
	#pagePath = null;
	#cssPath = null;
	#jsPath = null;

	fetchedHtmlNode = null;
	cssStyleSheet = null;
	jsModule = null;

	get systematicPath() { return this.#systematicPath; }
	get pagePath() { return this.#pagePath; }
	#generatePaths() {
		this.#cssPath = new Path('/css' + this.#systematicPath.str + '.css');
		this.#jsPath = new Path('/javascript' + this.#systematicPath.str + '.js');
	}

	activatePage(callbackFunc = PageData.defaultPageDataLoadFunc) {
		if (this.#systematicPath === null) {
			this.#systematicPath = this.hierarchyNode.getAbsolutePath();
			this.#pagePath = new Path('/html' + this.#systematicPath.str + '.html');
			this.#generatePaths();
		}

		if (this.fetchedHtmlNode === null) {
			this.fetchedHtmlNode = 1;
			this.cssStyleSheet = 1;
			this.jsModule = 1;
			fetch('/FetchedHtml' + this.systematicPath.str + '.html').then(response => {
				return response.text();
			}).then(fetchedData => {
				this.fetchedHtmlNode = document.createElement('div');
				this.fetchedHtmlNode.innerHTML = fetchedData;
				if (this.cssStyleSheet !== 1) {
					callbackFunc(this);
				}
			});
			fetch(this.#cssPath.str).then(response => {
				return response.text();
			}).then(fetchedData => {
				let styleSheet = new CSSStyleSheet();
				return styleSheet.replace(fetchedData);
			}).then(styleSheet => {
				this.cssStyleSheet = styleSheet;
				if (this.fetchedHtmlNode !== 1) {
					callbackFunc(this);
				}
			});
		} else if (this.fetchedHtmlNode === 1 || this.cssStyleSheet === 1) {
			return;
		} else {
			callbackFunc(this);
		}
	}

	constructor(inputHierarchyNodePath = null, inputPagePath = null) {
		if (inputHierarchyNodePath !== null) {
			this.#systematicPath = inputHierarchyNodePath;
			this.#pagePath = inputPagePath;
			this.#generatePaths();
		}
	}
}

export class PageDataController {
	hierarchy;
	#currentPageNode;
	#currentPageData;

	#pageHome;
	#page404;

	set currentPageNode(hierarchyNode) {
		this.#currentPageNode = hierarchyNode;
		if (this.#currentPageNode === null) {
			this.#currentPageData = this.#page404;
		} else if (this.#currentPageNode.parentNode === null) {
			this.#currentPageData = this.#pageHome;
		} else if (!this.currentPageNode.isBranch) {
			this.#currentPageData = this.#currentPageNode.data;
		}
		this.#currentPageData.activatePage();
	}
	get currentPageNode() { return this.#currentPageNode; }

	get currentPageData() { return this.#currentPageData; }

	constructor(inputNamesArray, defaultPageDataLoadFunc) {
		PageData.defaultPageDataLoadFunc = defaultPageDataLoadFunc;

		this.#pageHome = new PageData(new Path('/index'), new PageData('/index.html'));
		this.#page404 = new PageData(new Path('/404'), new PageData('/404.html'));

		this.hierarchy = new Hierarchy(inputNamesArray);
		this.#pageHome.hierarchyNode = this.hierarchy.root;
		for (let i = 0; i < this.hierarchy.leafNodes.length; ++i) {
			let leafNode = this.hierarchy.leafNodes[i];
			leafNode.data = new PageData();
			leafNode.data.hierarchyNode = leafNode;
		}
	}
};
