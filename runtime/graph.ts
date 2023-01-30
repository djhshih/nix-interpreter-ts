
export default class Graph<T extends PropertyKey> {
	// dependent nodes
	private dep_nodes: Record<T, Set<T>>;
	// independent nodes
	private indep_nodes: Set<T>;

	constructor() {
		this.dep_nodes = <any>{};
		this.indep_nodes = new Set<T>();
	}
	
	// add incoming edges to dependent node x
	public add_in_edges(node: T, edges: Set<T>) {
		if (this.dep_nodes[node]) {
			for (const e of edges) {
				this.dep_nodes[node].add(e);
			}
		} else {
			this.dep_nodes[node] = new Set(edges);
		}
	}

	// add independent node
	public add_indep_node(node: T): Set<T> {
		return this.indep_nodes.add(node);
	}

	// topological sort using Kahn's algorithm
	public sort(): T[] {
		let sorted: T[] = [];	

		while (this.indep_nodes.size > 0) {
			let res = this.indep_nodes.keys().next();
			if (res.done) break;
			let n = res.value;
			// remove node n from indep_nodes
			this.indep_nodes.delete(n);	
			// add node n to sorted
			sorted.push(n);
			// for each node m in dep_nodes, remove edge e from n to m
			for (let m in this.dep_nodes) {
				if (this.dep_nodes[m].has(n)) {
					this.dep_nodes[m].delete(n);
					// if m has no incoming edges, then it has become an
					// independent node
					if (this.dep_nodes[m].size == 0) {
						delete this.dep_nodes[m];
						this.indep_nodes.add(m);
					}
				}
			}
		}

		if (this.size() > 0) {
			throw `Unresolvable dependency: ${this.dep_nodes}`
		}

		return sorted;
	}

	public size(): number {
		return this.nodes().length;
	}

	public nodes() {
		return Object.keys(this.dep_nodes);
	}
}

