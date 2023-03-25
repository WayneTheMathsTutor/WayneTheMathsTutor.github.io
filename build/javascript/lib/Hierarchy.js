import * as Path from './Path.js'
export * as Path from './Path.js'

class HierarchyNode {
	#parentNode = null;
	#isBranch;
	#name = null;
	data = [];

	set parentNode(inputParentNode) {
		if (this.#parentNode) {
			for (let i = 0; i < this.#parentNode.data.length; ++i) {
				if (this.#parentNode.data[i] === this) {
					this.#parentNode.data.splice(i, 1);
					break;
				}
			}
		}

		if (inputParentNode != null) {
			inputParentNode.data.push(this);
		}

		this.#parentNode = inputParentNode;
	}
	get parentNode() { return this.#parentNode; }

	get isBranch() { return this.#isBranch; }

	set name(inputName) {
		if (!typeof(inputName) === 'string') {
			throw "Hierarchy: " + inputName + "is not a String."
		} else if (inputName.includes('/') && !(this.parentNode === null)) {
			throw "Hierarchy: Cannot use '/' in the name of a node."
		}
		this.#name = inputName;
	}
	get name() { return this.#name; }

	getAbsolutePath() {
		let iterNode = this;
		let nodeNames = [iterNode.name];
		while (iterNode.parentNode != null) {
			iterNode = iterNode.parentNode;
			nodeNames.push(iterNode.name);
		}
		nodeNames.reverse();

		return new Path(nodeNames, 1, this.#isBranch);
	}

	getChildNode(childNodeName) {
		if (!this.#isBranch) { return null; }
		for (let i = 0; i < this.data.length; ++i) {
			if (this.data[i].name === childNodeName) {
				return this.data[i];
			}
		}
		return null;
	}

	getNode(path) {
		if (path.isAbsolute) { return null; }
		let ret = this;
		for (let i = 0; i < path.length; ++i) {
			if (path.at(i) === '..') {
				ret = ret.parentNode;
			} else if (path.at(i) === '.') {
				continue;
			} else {
				ret = ret.getChildNode(path.at(i));
			}
			if (ret === null) { return null; }
		}
		return ret;
	}

	constructor(inputParentNode, inputName, inputIsBranch = true) {
		this.parentNode = inputParentNode;
		this.#isBranch = inputIsBranch;
		this.name = inputName;
	}
};

export class Hierarchy {
	#root = new HierarchyNode(null, '/');
	get root() { return this.#root; }

	getNode(path) {
		if (typeof path === "string") {
			path = new Path.Path(path);
		}
		if (!path.isAbsolute) { return null; }
		if (path.str === '/') {
			return this.#root;
		}
		let ret = this.#root;
		for (let i = 0; i < path.length; ++i) {
			ret = ret.getChildNode(path.at(i));
			if (ret === null) { return null; }
		}
		return ret;
	}

	setNodeDataFromArray(pathDataArray) {
		for (let i = 0; i < pathDataArray.length; ++i) {
			this.getNode(pathDataArray[i][0]).data = pathDataArray[i][1];
		}
	}

	createNodes(parentNode, namesArray) {
		for (let i = 0; i < namesArray.length; ++i) {
			if (Array.isArray(namesArray[i])) {
				let newNode = new HierarchyNode(parentNode, namesArray[i][0]);
				this.createNodes(newNode, namesArray[i].slice(1));
			} else {
				new HierarchyNode(parentNode, namesArray[i], false);
			}
		}
	}

	constructor(namesArray, pathDataArray) {
		this.createNodes(this.root, namesArray);
		this.setNodeDataFromArray(pathDataArray);
	}
};
