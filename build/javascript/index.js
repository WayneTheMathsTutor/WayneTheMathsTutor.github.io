import {Path} from '/javascript/lib/Path.js'
import {Hierarchy} from '/javascript/lib/Hierarchy.js'
import * as StyleSheetFunctions from '/javascript/lib/StyleSheetFunctions.js'
import {PageData, PageDataController} from '/javascript/lib/PageNavigation.js'

class NavBar_UI {
	domNode;
	logoBtn;
	navBtns = [];

	cssMenuOpen;

	constructor(navBtnNames, navBtnEvents) {
		this.domNode = document.getElementById('mainNav');
		this.logoBtn = this.domNode.children[0].children[0];
		this.cssMenuOpen = new StyleSheetFunctions.CssToggleValue('/css/Global.css', 'body', '--menuOpen', ['0', '1']);

		this.logoBtn.addEventListener('click', navBtnEvents[0]);
		this.domNode.children[1].children[0].addEventListener('click', this.cssMenuOpen.toggle.bind(this.cssMenuOpen));
		for (let i = 0; i < navBtnNames.length; ++i) {
			let btn = document.createElement("button");
			btn.appendChild(new Text(navBtnNames[i]));
			btn.addEventListener('click', navBtnEvents[i]);
			this.navBtns.push(btn);
		}
		this.domNode.children[1].children[1].append(...this.navBtns);
	}
};

class NavBar {
	#pageDataController;
	#homeNode;
	#UI;

	navHome(eventObj) {
		this.#pageDataController.currentPage = this.#homeNode;
		history.pushState({}, "", '/');
		this.#UI.cssMenuOpen.close();
	}

	navBtnFunc(eventObj) {
		let index = 1;
		while (index < this.#UI.navBtns.length) {
			if (this.#UI.navBtns[index] === eventObj.currentTarget) {
				this.#pageDataController.currentPage = this.#homeNode.children[index - 1];
				history.pushState({}, '', this.#pageDataController.currentPageNode.data.pagePath.str);
				break;
			}
			++index;
		}
		this.#UI.cssMenuOpen.close();
	}

	constructor(pageDataController, currentPath) {
		this.#pageDataController = pageDataController;
		this.#homeNode = this.#pageDataController.hierarchy.root;

		let node = (currentPath.str === '/index.html') ? 
			this.#homeNode : 
			this.#pageDataController.hierarchy.getNode(currentPath);
		this.#pageDataController.currentPage = node;

		let btnNames = ["Home"];
		this.#homeNode.getChildrenNames(btnNames);
		let btnEvents = [this.navHome.bind(this)];
		for (let i = 1; i < btnNames.length; ++i) {
			btnEvents.push(this.navBtnFunc.bind(this));
		}
		this.#UI = new NavBar_UI(btnNames, btnEvents);
	}
};

let mainContentNode = document.getElementById('mainContent');
function dataReady(pageData) {
	if (pageDataController.currentPageData === pageData) {
		mainContentNode.replaceChildren(pageData.fetchedHtmlNode);
		document.body.scrollTop = 0;
		document.adoptedStyleSheets[0] = pageData.cssStyleSheet;
	}
}

function pageUrlToNodePath() {
	return new Path((window.location.pathname.startsWith('/html/')) ? window.location.pathname.substring(5, window.location.pathname.length - 5) : window.location.pathname);
}

let pageDataController;
let navBar;
(function () {
	pageDataController = new PageDataController([
		'About',
		'PrivateTuition',
		'Testimonials',
		'FAQs',
		'Contact',
	],
	dataReady
	);
	document.adoptedStyleSheets = [new CSSStyleSheet()];

	navBar = new NavBar(pageDataController, pageUrlToNodePath());

	addEventListener('popstate', (event) => {
		let destNode = pageDataController.hierarchy.getNode(pageUrlToNodePath());
		navBar.currentNode = destNode;
	})
})();
