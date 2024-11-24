import * as THREE from 'three'

export class QuadTree {

    root: Node;
    bounds: THREE.Box2;
    MIN_NODE_SIZE: number = 500;

    constructor(bounds: THREE.Box2) 
    {
        this.bounds = bounds;
        this.root = new Node(bounds);
    }

    public insert(position2D: THREE.Vector2) {
        this.insertAtNode(this.root, position2D)
    }

    private insertAtNode(node: Node, position2D: THREE.Vector2) {
        // calculate distance to node
        let cameraDistanceToNode = node.bounds.getCenter(new THREE.Vector2()).distanceTo(position2D);

        let nodeSize = node.bounds.getSize(new THREE.Vector2()).x;

        if(cameraDistanceToNode < nodeSize && nodeSize > this.MIN_NODE_SIZE) {
            if(node.children.length == 0)
                node.split();

            node.children.forEach(childNode => {
                this.insertAtNode(childNode, position2D);
            })
        }
        else {
            node.merge();
        }
    }

    getChildren(): Node[] {
        return this.root.getChildren();
    }
    
    getTotalNodeCount(): number {

        return this.root.getTotalNodeCount();
    }
}

export class Node {

    bounds: THREE.Box2;
    children: Node[] = [];
    //offset: THREE.Vector2;
    //verticesPerSide: number;

    constructor(bounds: THREE.Box2) {//, offset: THREE.Vector2, verticesPerSide: number) {
        this.bounds = bounds;
        //this.offset = offset;
        //this.verticesPerSide = verticesPerSide;
    }

    split(): void {

        let center = this.bounds.getCenter(new THREE.Vector2);

        let upperLeft = new Node(new THREE.Box2(
            new THREE.Vector2(this.bounds.min.x, this.bounds.min.y),
            center
        ));

        let lowerLeft = new Node(new THREE.Box2(
            new THREE.Vector2(this.bounds.min.x, center.y),
            new THREE.Vector2(center.x, this.bounds.max.y),
        ));

        let upperRight = new Node(new THREE.Box2(
            new THREE.Vector2(center.x, this.bounds.min.y),
            new THREE.Vector2(this.bounds.max.x, center.y)
        ));

        let lowerRight = new Node(new THREE.Box2(
            new THREE.Vector2(center.x, center.y),
            new THREE.Vector2(this.bounds.max.x, this.bounds.max.y)
        ));
        
        this.children.push(upperLeft);
        this.children.push(lowerLeft);
        this.children.push(upperRight);
        this.children.push(lowerRight);
    }

    merge(): void {
        // fast
        this.children.length = 0;        
    }

    getChildren(): Node[] {

        let children: Node[] = [];

        if(this.children.length == 0) {
            children.push(this);
            return children;
        }
        
        this.children.forEach(x => {
            children.push(...this.getChildren());
        })

        return children;
    }

    getTotalNodeCount(): number {
        
        if(this.children == null || this.children?.length == 0)
            return 1;

        let count = 0;
        for(const child of this.children)
        {
            count += child.getTotalNodeCount();
        }
        return count;
    }
}
