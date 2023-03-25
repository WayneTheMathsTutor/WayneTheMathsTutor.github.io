import * as StyleSheetFunctions from './lib/StyleSheetFunctions.js'
import {Path, Hierarchy} from './lib/Hierarchy.js'

class PageData {
	pathID;
	htmlData = null;

	fetchData(callbackFunc) {
		fetch('/FetchedHtml' + this.pathID.str + '.html').then(response => {
			return response.text();
		}).then(fetchedData => {
			this.htmlData = fetchedData;
			callbackFunc(this);
		});
	}

	constructor(inputPathID) {
		if (typeof inputPathID === 'string') {
			this.pathID = new Path.Path(inputPathID);
		} else {
			this.pathID = inputPathID;
		}
	}
};

class DataController {
	#hierarchy;
	#currentNode;
	#pages = [
		new PageData('/'),
		new PageData('/About'),
		new PageData('/PrivateTuition'),
		new PageData('/MathsLive'),
		new PageData('/Testimonials'),
		new PageData('/FAQs'),
		new PageData('/Contact')
	];

	set currentNode(path) {
		if (path.isAbsolute) {
			this.#currentNode = this.#hierarchy.getNode(path);
		} else {
			this.#currentNode = this.#currentNode.getNode(path);
		}

		let pageData;
		if (!this.#currentNode.isBranch) {
			pageData = this.#currentNode.data;
			if (pageData.htmlData === null) {
				pageData.fetchData(dataReady);
			} else {
				dataReady(pageData);
			}
		} else if (this.#currentNode.parentNode === null) {
			pageData = this.#pages[0];
			dataReady(pageData);
		} else {
			return;
		}

	}
	get currentNode() { return this.#currentNode; }

	constructor() {
		fetch('/FetchedHtml/index.html').then(response => {
			return response.text();
		}).then(fetchedData => {
			this.#pages[0].htmlData = fetchedData;
			dataReady(this.#pages[0]);
		});
		let hierarchyDataArray = [];
		for (let i = 1; i < this.#pages.length; ++i) {
			hierarchyDataArray.push([
				this.#pages[i].pathID,
				this.#pages[i]
			]);
		}

		this.#hierarchy = new Hierarchy([
			"About",
			"PrivateTuition",
			"MathsLive",
			"Testimonials",
			"FAQs",
			"Contact"
		], hierarchyDataArray);
	}
};

function dataReady(pageData) {
	if (pageData === dataController.currentNode.data ||
		(dataController.currentNode.parentNode === null &&
		pageData.pathID.str === '/')
	) {
		document.querySelector('#mainContent').innerHTML = pageData.htmlData;
		document.querySelector('body').scrollTop = 0;
	}
}

let dataController = new DataController();
(function () {
	// Setup Header Button Event
	document.querySelector('header #headerTitle').addEventListener('click', (event) => {
		dataController.currentNode = new Path.Path('/');
		history.pushState({}, "", '/');
	});

	// Setup Menu Button Event
	document.querySelector('nav >button:first-child').addEventListener('click', (event) => {
		StyleSheetFunctions.toggleValue('/css/index.css', 'body', '--menuOpen', '0', '1');
	});

	// Setup Nav Button Events
	let navButtons = document.querySelectorAll('#menuItemContainer button');
	let fetchedDataPaths = [
		"/",
		"/About",
		"/PrivateTuition",
		"/MathsLive",
		"/Testimonials",
		"/FAQs",
		"/Contact"
	];
	for (let i = 0; i < navButtons.length; ++i) {
		let historyPath = (i == 0) ? '/' : '/html' + fetchedDataPaths[i] + '.html';
		navButtons[i].addEventListener('click', (event) => {
			dataController.currentNode = new Path.Path(fetchedDataPaths[i]);
			history.pushState({}, "", historyPath);
			StyleSheetFunctions.setValue('/css/index.css', 'body', '--menuOpen', '0');
		});
	}

	let navPath = (window.location.pathname.startsWith('/html/')) ? window.location.pathname.substring(5, window.location.pathname.length - 5) : '/';
	dataController.currentNode = new Path.Path(navPath);

	// Setup popstate
	addEventListener('popstate', (event) => {
		let navPath = (window.location.pathname.startsWith('/html/')) ? window.location.pathname.substring(5, window.location.pathname.length - 5) : '/';
		dataController.currentNode = new Path.Path(navPath);
	})
})();