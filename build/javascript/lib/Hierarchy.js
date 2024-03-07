import {Path} from './Path.js'

class HierarchyNode {
	#parentNode = null;
	#name = null;

	set parentNode(parentNode) {
		if (parentNode != null) {
			parentNode.appendChild(this);
		}

		if (this.#parentNode) {
			this.#parentNode.removeChild(this);
		}

		this.#parentNode = parentNode;
	}
	setParentNodeManually(parentNode) { this.#parentNode = parentNode; }
	get parentNode() { return this.#parentNode; }

	set name(name) {
		if (typeof name !== "string") {
			throw "HierarchyNode.setName Error: Name must be a String.";
		} else if (name.includes('/')) {
			throw "HierarchyNode.setName Error: Name cannot contain a '/'.";
		}

		this.#name = name;
	}
	setNameManually(name) { this.#name = name; }
	get name() { return this.#name; }

	getAbsolutePath() {
		let iterNode = this;
		let nodeNames = [];
		while (iterNode.parentNode != null) {
			nodeNames.unshift(iterNode.name);
			iterNode = iterNode.parentNode;
		}

		return new Path(nodeNames, 1, this.isBranch);
	}

	getNode(relativePath) {
		if (relativePath.isAbsolute) {
			throw "HierarchyNode.getNode Error: Path should be relative.";
		}

		let ret = this;
		for (let i = 0; i < relativePath.length; ++i) {
			let pathComp = relativePath.array.at(i);
			if (pathComp === '..') {
				ret = ret.parentNode;
				if (ret === null) {
					throw "HierarchyNode.getNode Error: Cannot .. past root node.";
				}
			} else if (pathComp != '.') {
				ret = ret.getChild(pathComp);
				if (ret === undefined) {
					return ret;
				}
			}
		}

		return ret;
	}

	constructor(parentNode, name) {
		this.parentNode = parentNode;
		this.name = name;
	}
};

export const HierarchyNodeID = Object.freeze({
	BRANCHNODE: 0,
	BRANCHDATANODE: 1,
	DATANODE: 2
});

export class BranchNode extends HierarchyNode {
	static nodeID = HierarchyNodeID.BRANCHNODE;
	get isBranch() { return true; }
	get hasData() { return false; }

	children;

	getChildrenNames = getChildrenNames;
	getChild = getChild;
	appendChild = appendChild;
	removeChild = removeChild;

	convertToBranchData = convertToBranchData;

	constructor(parentNode, name, children = []) {
		super(parentNode, name);
		this.children = children;
	}
};

export class BranchDataNode extends HierarchyNode {
	static nodeID = HierarchyNodeID.BRANCHDATANODE;
	get isBranch() { return true; }
	get hasData() { return true; }

	children;
	data;

	getChildrenNames = getChildrenNames;
	getChild = getChild;
	appendChild = appendChild;
	removeChild = removeChild;

	constructor(parentNode, name, children = [], data = null) {
		super(parentNode, name);
		this.children = children;
		this.data = data;
	}
};

export class DataNode extends HierarchyNode {
	static nodeID = HierarchyNodeID.DATANODE;
	get isBranch() { return false; }
	get hasData() { return true; }

	data;

	constructor(parentNode, name, data) {
		super(parentNode, name);
		this.data = data;
	}
};

export class Hierarchy {
	#root;
	get root() { return this.#root; }

	getNode(absolutePath) {
		if (!absolutePath.isAbsolute) {
			throw "Hierarchy.getNode Error: Path should be absolute.";
		}
		if (absolutePath.str === '/') { return this.#root; }

		return this.#root.getNode(new Path(absolutePath.str.substring(1)));
	}

	createNodes(parentNode, namesArray) {
		for (let i = 0; i < namesArray.length; ++i) {
			if (Array.isArray(namesArray[i])) {
				let newNode = new BranchNode(parentNode, namesArray[i][0]);
				this.createNodes(newNode, namesArray[i].slice(1));
			} else {
				let node = new DataNode(parentNode, namesArray[i], false);
			}
		}
	}

	#getDataNodes(node) {
		let dataNodes = [];
		if (node.isBranch) {
			for (let i = 0; i < node.children.length; ++i) {
				let childNode = node.children[i];
				if (childNode.hasData) {
					dataNodes.push(childNode);
				}

				if (childNode.isBranch) {
					dataNodes = dataNodes.concat(this.#getDataNodes(childNode));
				}
			}
		}

		return dataNodes;
	}

	getDataNodes(node = this.#root) {
		let dataNodes = [];
		if (node.hasData) {
			dataNodes.push(node);
		}

		dataNodes = dataNodes.concat(this.#getDataNodes(node));
		return dataNodes;
	}

	constructor(namesArray, rootNodeID = HierarchyNodeID.BRANCHNODE) {
		switch (rootNodeID) {
			case HierarchyNodeID.BRANCHNODE:
				this.#root = new BranchNode(null, '');
				break;
			case HierarchyNodeID.BRANCHDATANODE:
				this.#root = new BranchDataNode(null, '');
				break;
		}
		this.#root.setNameManually('/');
		this.createNodes(this.root, namesArray);
	}
};

function getChildrenNames(names = []) {
	this.children.forEach((element) => {
		names.push(element.name);
	});
	return names;
}

function getChild(name) {
	return this.children.find((hierarchyNode) => {
		return (hierarchyNode.name === name);
	});
}

function insertChild(node, index) {
	const dupIndex = this.children.findIndex((branchNode) => {
		return (branchNode === node);
	});

	if (dupIndex !== -1) {
		throw "insertChild Error: Cannot insertChild as node name " + node.name + " already exists.";
	}

	this.children.splice(index, 0, node);
}

function appendChild(node) {
	const index = this.children.findIndex((hierarchyNode) => {
		return (hierarchyNode.name === node.name);
	});

	if (index !== -1) {
		throw "appendChild Error: Cannot appendChild as node name " + node.name + " already exists.";
	}

	this.children.push(node);
}

function removeChild(node) {
	const index = this.children.findIndex((hierarchyNode) => {
		return (hierarchyNode === node);
	});

	if (index === -1) {
		throw "removeChild Error: Cannot remove child as this node is not registered in children.";
	}

	this.children.splice(index, 1);
}

function convertToBranchData(data = null) {
	let branchDataNode = new BranchDataNode(null, this.name, this.children);
	branchDataNode.setParentNodeManually(this.parentNode);

	if (this.parentNode !== null) {
		let pos = this.parentNode.children.findIndex((node) => {
			return (node === this);
		});

		parentNode.children[pos] = branchDataNode;
	}

	branchDataNode.children.forEach((node) => {
		node.setParentNodeManually(branchDataNode);
	});

	return branchDataNode;
}
