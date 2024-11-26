import * as THREE from 'three'
export class Node {

    bounds: THREE.Box2;
    children: Node[] = [];
    //offset: THREE.Vector2;
    //verticesPerSide: number;
    mesh?: THREE.Mesh;

    constructor(bounds: THREE.Box2) {//, offset: THREE.Vector2, verticesPerSide: number) {
        this.bounds = bounds;
        //this.offset = offset;
        //this.verticesPerSide = verticesPerSide;
    }

    public split(scene: THREE.Scene): void {

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
            center,
            new THREE.Vector2(this.bounds.max.x, this.bounds.max.y)
        ));
        
        this.children.push(upperLeft);
        this.children.push(lowerLeft);
        this.children.push(upperRight);
        this.children.push(lowerRight);

        console.log(`Splitting node with bounds: min(${this.bounds.min.x}, ${this.bounds.min.y}) -> max(${this.bounds.max.x}, ${this.bounds.max.y})`);
        console.log(`Upper Left:  min(${upperLeft.bounds.min.x}, ${upperLeft.bounds.min.y}) -> max(${upperLeft.bounds.max.x}, ${upperLeft.bounds.max.y})`);
        console.log(`Lower Left:  min(${lowerLeft.bounds.min.x}, ${lowerLeft.bounds.min.y}) -> max(${lowerLeft.bounds.max.x}, ${lowerLeft.bounds.max.y})`);
        console.log(`Upper Right: min(${upperRight.bounds.min.x}, ${upperRight.bounds.min.y}) -> max(${upperRight.bounds.max.x}, ${upperRight.bounds.max.y})`);
        console.log(`Upper Left:  min(${lowerRight.bounds.min.x}, ${lowerRight.bounds.min.y}) -> max(${lowerRight.bounds.max.x}, ${lowerRight.bounds.max.y})`);
        //this.mesh?.disposeMeshAndRemoveFromScene(scene);
        //if(this.mesh != null)
            //this.mesh!.visible = false;
    }

    public merge(scene: THREE.Scene): void {
        // fast
        this.children.forEach(x => 
        {
            x.merge(scene);

            let temp = scene as THREE.Scene;
            x.mesh?.disposeMeshAndRemoveFromScene(temp);     
        });   
        this.children.length = 0;  

        /*
        if(this.children.length > 0)
            this.children.forEach(x => x.merge(scene));                
        else
        {
            this.mesh?.disposeMeshAndRemoveFromScene(scene);     
            this.children.length = 0;      
        } 
        */           
    }

    public getChildren(): Node[] {

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

    public getTotalNodeCount(): number {
        
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