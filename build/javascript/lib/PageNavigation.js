import {HierarchyNodeID, Hierarchy} from './Hierarchy.js'
import {Path} from './Path.js'

export class PageData {
	static defaultPageDataLoadFunc;

	#systematicPath = null;
	#pagePath = null;
	#cssPath = null;
	#jsPath = null;

	fetchedHtmlNode = null;
	cssStyleSheet = null;
	jsModule = null;

	get pagePath() { return this.#pagePath; }

	activatePage(callbackFunc = PageData.defaultPageDataLoadFunc) {
		if (this.fetchedHtmlNode === null) {
			if (!(this.#systematicPath instanceof Path)) {
				this.#generatePaths();
			}
			this.fetchedHtmlNode = 1;
			this.cssStyleSheet = 1;
			this.jsModule = 1;
			fetch('/FetchedHtml' + this.#systematicPath.str + '.html').then(response => {
				return response.text();
			}).then(fetchedData => {
				this.fetchedHtmlNode = document.createElement('div');
				this.fetchedHtmlNode.innerHTML = fetchedData;
				if (this.cssStyleSheet !== 1 && this.jsModule !== 1) {
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
				if (this.fetchedHtmlNode !== 1 && this.jsModule !== 1) {
					callbackFunc(this);
				}
			});
			import(this.#jsPath.str).then((module) => {
				this.jsModule = module;
				if (this.fetchedHtmlNode !== 1 && this.cssStyleSheet !== 1) {
					callbackFunc(this);
				}
			});
		} else if (this.fetchedHtmlNode === 1 || this.cssStyleSheet === 1) {
			return;
		} else {
			callbackFunc(this);
		}
	}

	#generatePaths() {
		this.#systematicPath = this.#systematicPath.getAbsolutePath();
		this.#pagePath = new Path('/html' + this.#systematicPath.str + '.html');
		this.#cssPath = new Path('/css' + this.#systematicPath.str + '.css');
		this.#jsPath = new Path('/javascript' + this.#systematicPath.str + '.js');
	}

	manualSetup(systematicPath, pagePath, cssPath, jsPath) {
		if (this.#systematicPath === null) {
			this.#systematicPath = systematicPath;
			this.#pagePath = pagePath;
			this.#cssPath = cssPath;
			this.#jsPath = jsPath;
		}
	}

	constructor(hierarchyNode = null) {
		this.#systematicPath = hierarchyNode;
	}
}

export class PageDataController {
	hierarchy;
	#currentPage = [null, null];

	#page404 = new PageData();

	set currentPage(dataNode) {
		if (dataNode == null) {
			this.#currentPage[0] = null;
			this.#currentPage[1] = this.#page404;
			this.#currentPage[1].activatePage();
			return;
		}

		if (dataNode.hasData) {
			this.#currentPage[0] = dataNode;
			this.#currentPage[1] = this.#currentPage[0].data;
			this.#currentPage[1].activatePage();
		} else {
			throw "PageNavigation.js: currentPage cannot be set with a node that doesn't have data."
		}
	}
	get currentPageNode() { return this.#currentPage[0]; }
	get currentPageData() { return this.#currentPage[1]; }

	constructor(inputNamesArray, defaultPageDataLoadFunc) {
		PageData.defaultPageDataLoadFunc = defaultPageDataLoadFunc;

		this.#page404.manualSetup(new Path('/404'), new Path('/404.html'), new Path ('/css/404.css'), new Path('/javascript/404.js'));

		this.hierarchy = new Hierarchy(inputNamesArray, HierarchyNodeID.BRANCHDATANODE);
		this.hierarchy.root.data = new PageData();
		this.hierarchy.root.data.manualSetup(new Path('/index'), new Path('/index.html'), new Path ('/css/index.css'), new Path('/javascript/index.js'));
		let dataNodes = this.hierarchy.getDataNodes();
		for (let i = 1; i < dataNodes.length; ++i) {
			dataNodes[i].data = new PageData(dataNodes[i]);
		}
	}
};
