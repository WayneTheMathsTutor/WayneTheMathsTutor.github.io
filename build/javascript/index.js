import {Path} from './lib/Path.js'
import {Hierarchy} from './lib/Hierarchy.js'
import * as StyleSheetFunctions from './lib/StyleSheetFunctions.js'

import {PageData, PageDataController} from './lib/PageNavigation.js'

class NavBar {
	#pageDataController;
	#homeNode;
	#cssomMenuOpen;

	#navBtns = [];

	navBtnFunc(eventObj) {
		if (eventObj.currentTarget === this.#navBtns[0]) {
			this.#pageDataController.currentPageNode = this.#homeNode;
			history.pushState({}, '', '/');
		} else {
			let index = 1;
			while (index < this.#navBtns.length) {
				if (this.#navBtns[index] === eventObj.currentTarget) {
					this.#pageDataController.currentPageNode = this.#homeNode.data[index - 1];
					history.pushState({}, '', this.#pageDataController.currentPageNode.data.pagePath.str);
					break;
				}
				++index;
			}
		}
		this.#cssomMenuOpen.style.setProperty('--menuOpen', '0');
	}

	constructor(pageDataController, currentPath) {
		this.#pageDataController = pageDataController;
		this.#homeNode = this.#pageDataController.hierarchy.root;
		this.#cssomMenuOpen = StyleSheetFunctions.findRule('/css/Global.css', 'body');

		let homeBtn = document.createElement("button");
		homeBtn.innerHTML = 'Home';
		homeBtn.addEventListener('click', this.navBtnFunc.bind(this));
		this.#navBtns.push(homeBtn);
		for (let i = 0; i < this.#homeNode.data.length; ++i) {
			let btn = document.createElement("button");
			btn.innerHTML = this.#homeNode.data[i].name;
			btn.addEventListener('click', this.navBtnFunc.bind(this));
			this.#navBtns.push(btn);
		}
		document.querySelector('#menuItemContainer').append(...this.#navBtns);

		let node = (currentPath.str === '/index.html') ? 
			this.#homeNode : 
			this.#pageDataController.hierarchy.getNode(currentPath);
		this.#pageDataController.currentPageNode = node;

		document.querySelector('#headerTitle').addEventListener('click', (event) => {
			pageDataController.currentPageNode = this.#pageDataController.hierarchy.root;
			history.pushState({}, "", '/');
		});

		document.querySelector('nav >button:first-child').addEventListener('click', (event) => {
			let setVal = '1';
			if (this.#cssomMenuOpen.style.getPropertyValue('--menuOpen') == setVal) {
				setVal = '0';
			}
			this.#cssomMenuOpen.style.setProperty('--menuOpen', setVal);
		});
	}
};

let mainContentNode = document.getElementById('mainContent');
function dataReady(pageData) {
	if (pageDataController.currentPageData == pageData) {
		mainContentNode.replaceChildren(pageData.fetchedHtmlNode);
		document.body.scrollTop = 0;
		document.adoptedStyleSheets = [pageData.cssStyleSheet];
	}
}

let pageDataController;
let navBar;
(function () {
	pageDataController = new PageDataController([
		'About',
		'PrivateTuition',
		'MathsLive',
		'Testimonials',
		'FAQs',
		'Contact',
	],
	dataReady
	);

	let navPath = new Path((window.location.pathname.startsWith('/html/')) ? window.location.pathname.substring(5, window.location.pathname.length - 5) : window.location.pathname);
	navBar = new NavBar(pageDataController, navPath);

	// Setup popstate
	addEventListener('popstate', (event) => {
		let navPath = new Path((window.location.pathname.startsWith('/html/')) ? window.location.pathname.substring(5, window.location.pathname.length - 5) : window.location.pathname);
		pageDataController.currentPageNode = pageDataController.hierarchy.getNode(navPath);
	})
})();
