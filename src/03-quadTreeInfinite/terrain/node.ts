import * as THREE from 'three'
import { SimplexNoiseGenerator } from '../../shared/simplexNoiseGenerator';
import { TreeGenerator } from './treeGenerator';

export class Node {

    children: Node[] = [];

    mesh?: THREE.Mesh;
    grassBillboards?: THREE.Points;

    grassInstancedMesh?: THREE.InstancedMesh;
    grassInstancedMeshCounter: number = 0;
    
    instancedTreeMesh?: THREE.InstancedMesh;
    
    constructor(public bounds: THREE.Box2, private lod: number) {
    }

    public split(scene: THREE.Scene): void {

        let center = this.bounds.getCenter(new THREE.Vector2);

        let upperLeft = new Node(new THREE.Box2(
            new THREE.Vector2(this.bounds.min.x, this.bounds.min.y),
            center),
            this.lod + 1
        );

        let lowerLeft = new Node(new THREE.Box2(
            new THREE.Vector2(this.bounds.min.x, center.y),
            new THREE.Vector2(center.x, this.bounds.max.y)),
            this.lod + 1
        );

        let upperRight = new Node(new THREE.Box2(
            new THREE.Vector2(center.x, this.bounds.min.y),
            new THREE.Vector2(this.bounds.max.x, center.y)),
            this.lod + 1
        );

        let lowerRight = new Node(new THREE.Box2(
            center,
            new THREE.Vector2(this.bounds.max.x, this.bounds.max.y)),
            this.lod + 1
        );
        
        this.children.push(upperLeft);
        this.children.push(lowerLeft);
        this.children.push(upperRight);
        this.children.push(lowerRight);

        console.log(`Splitting node with bounds: min(${this.bounds.min.x}, ${this.bounds.min.y}) -> max(${this.bounds.max.x}, ${this.bounds.max.y})`);
        console.log(`Upper Left:  min(${upperLeft.bounds.min.x}, ${upperLeft.bounds.min.y}) -> max(${upperLeft.bounds.max.x}, ${upperLeft.bounds.max.y})`);
        console.log(`Lower Left:  min(${lowerLeft.bounds.min.x}, ${lowerLeft.bounds.min.y}) -> max(${lowerLeft.bounds.max.x}, ${lowerLeft.bounds.max.y})`);
        console.log(`Upper Right: min(${upperRight.bounds.min.x}, ${upperRight.bounds.min.y}) -> max(${upperRight.bounds.max.x}, ${upperRight.bounds.max.y})`);
        console.log(`Upper Left:  min(${lowerRight.bounds.min.x}, ${lowerRight.bounds.min.y}) -> max(${lowerRight.bounds.max.x}, ${lowerRight.bounds.max.y})`);
    }

    public merge(scene: THREE.Scene): void {
        // fast
        this.children.forEach(x => 
        {
            x.merge(scene);

            x.mesh?.disposeMeshAndRemoveFromScene(scene);     
            x.grassBillboards?.disposeAndRemoveFromScene(scene);
            x.grassInstancedMesh?.disposeMeshAndRemoveFromScene(scene);
            x.instancedTreeMesh?.disposeMeshAndRemoveFromScene(scene);
        });   
        this.children.length = 0;  
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

    public generateGrassBillboards(textureName: string, simplexNoiseGenerator: SimplexNoiseGenerator, bounds: THREE.Box2, yMin: number, yMax: number, maxCount: number) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
    
        const sprite = new THREE.TextureLoader().load( textureName );
        sprite.colorSpace = THREE.SRGBColorSpace;
    
        for ( let i = 0; i < maxCount; i ++ ) {
    
            const x = bounds.min.x + bounds.getSize(new THREE.Vector2()).x * Math.random();
            const z = -bounds.min.y - bounds.getSize(new THREE.Vector2()).y * Math.random();
    
            let elevation = simplexNoiseGenerator.getHeightFromNoiseFunction(x, -z);
            if(elevation > yMin && elevation < yMax)
                vertices.push( x, elevation, z);
        }
    
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    
        var material = new THREE.PointsMaterial( { size: 3, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: true, depthTest: true, depthWrite: false } );
        material.color.setHSL( 1.0, 0.3, 0.7, THREE.SRGBColorSpace );
    
        this.grassBillboards = new THREE.Points( geometry, material );
    }

    public generateGrassInstancedMesh(textureName: string, simplexNoiseGenerator: SimplexNoiseGenerator, bounds: THREE.Box2, yMin: number, yMax: number, maxCount: number) {
   
        const plane = new THREE.PlaneGeometry(3);

        const sprite = new THREE.TextureLoader().load( textureName );
        sprite.colorSpace = THREE.SRGBColorSpace;
    
        const material = new THREE.ShaderMaterial({
            vertexShader: /* glsl */`            
            uniform sampler2D uTexture;

            varying vec2 vUv;

            void main() {
                    vUv = uv;

                    vec4 worldPosition = instanceMatrix * vec4(position, 1.0);

                    //vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
                    vec4 projectedPosition = projectionMatrix * modelViewMatrix * worldPosition;

                    gl_Position = projectedPosition;
                }
                `,
            fragmentShader: `
                uniform sampler2D uTexture;

                varying vec2 vUv;

                void main() {

                    //gl_FragColor = vec4(1, 1, 1, 1);//textureColor;

                    vec4 textureColor = texture2D(uTexture, vUv);                  
                    if(textureColor.a < 0.8)  
                        discard;

                    //gl_FragColor = vec4(textureColor.r, textureColor.g, textureColor.b, 0.2);
                    gl_FragColor = textureColor;

                }
            `,
            uniforms: {
                uTexture: {value: sprite }                    
            },
            transparent: true        
        });

        this.grassInstancedMesh = new THREE.InstancedMesh(plane.clone(), material, maxCount);
        
        const dummy = new THREE.Object3D();
        for ( let i = 0; i < maxCount; i ++ ) {
    
            const x = bounds.min.x + bounds.getSize(new THREE.Vector2()).x * Math.random();
            const z = -bounds.min.y - bounds.getSize(new THREE.Vector2()).y * Math.random();
    
            let elevation = simplexNoiseGenerator.getHeightFromNoiseFunction(x, -z);
            if(elevation > yMin && elevation < yMax) {
                
                dummy.position.set(x, elevation, z);
                dummy.rotation.y = Math.random() * Math.PI * 2;
                dummy.updateMatrix();
                this.grassInstancedMesh.setMatrixAt(this.grassInstancedMeshCounter++, dummy.matrix);
            }
        }    

        console.log(`grass instancedmesh count for node: ${this.grassInstancedMesh.count}`);
    }

    public generateTreeModels(vegetationMeshGenerator: TreeGenerator) {
        this.instancedTreeMesh = vegetationMeshGenerator.generateForNode(this.bounds, this.mesh!, 200);        
    }
}