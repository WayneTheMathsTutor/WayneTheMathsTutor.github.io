import * as ErrorModule from './ErrorModule.js'
import {Path} from './Path.js'

class HierarchyNode {
	#parentNode = null;
	#isBranch;
	name = null;
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

	getAbsolutePath() {
		let iterNode = this;
		let nodeNames = [];
		while (iterNode.parentNode != null) {
			nodeNames.push(iterNode.name);
			iterNode = iterNode.parentNode;
		}
		nodeNames.reverse();

		return new Path(nodeNames, 1, this.#isBranch);
	}

	getChildNode(childNodeName) {
		if (!this.#isBranch) {
			ErrorModule.setError(1, "HierarchyNode.getChildNode Error: Node " + this.name + " is not a branch.");
			return null;
		}

		for (let i = 0; i < this.data.length; ++i) {
			if (this.data[i].name === childNodeName) {
				return this.data[i];
			}
		}

		ErrorModule.setError(2, "HierarchyNode.getChildNode Error: Cannot find child named: " + childNodeName + " on node " + this.name + ".");
		return null;
	}

	getNode(path) {
		if (path.isAbsolute) {
			ErrorModule.setError(1, "HierarchyNode.getNode Error: Path should be relative.");
			return null;
		}

		let ret = this;
		for (let i = 0; i < path.length; ++i) {
			if (path.at(i) === '..') {
				ret = ret.parentNode;
				if (ret === null) {
					ErrorModule.setError(2, "HierarchyNode.getNode Error: Cannot .. past root node.");
					return null;
				}
			} else if (path.at(i) === '.') {
				continue;
			} else {
				ret = ret.getChildNode(path.at(i));
			}
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

	leafNodes = [];

	getNode(path) {
		if (!path.isAbsolute) {
			ErrorModule.setError(1, "Hierarchy.getNode Error: Path should be absolute.");
			return null;
		}
		if (path.str === '/') { return this.#root; }

		let ret = this.#root;
		for (let i = 0; i < path.length; ++i) {
			ret = ret.getChildNode(path.at(i));
		}
		return ret;
	}

	createNodes(parentNode, namesArray) {
		for (let i = 0; i < namesArray.length; ++i) {
			if (Array.isArray(namesArray[i])) {
				let newNode = new HierarchyNode(parentNode, namesArray[i][0]);
				this.createNodes(newNode, namesArray[i].slice(1));
			} else {
				let node = new HierarchyNode(parentNode, namesArray[i], false);
				this.leafNodes.push(node);
			}
		}
	}

	constructor(namesArray) {
		this.createNodes(this.root, namesArray);
	}
};
