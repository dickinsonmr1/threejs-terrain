import * as THREE from 'three'
import { MeshGenerator } from '../meshGenerator';
import { SimplexNoiseGenerator } from '../chunk/simplexNoiseGenerator';
import { TerrainGeneratorParams } from '../chunk/terrainGeneratorParams';

export class QuadTree {

    meshGenerator: MeshGenerator;
    root: Node;
    bounds: THREE.Box2;
    simplexNoiseGenerator: SimplexNoiseGenerator;

    shaderMaterial: THREE.Material;

    terrainGeneratorParams: TerrainGeneratorParams;

    MIN_NODE_SIZE: number = 64;

    constructor(bounds: THREE.Box2, simplexNoiseGenerator: SimplexNoiseGenerator, terrainGeneratorParams: TerrainGeneratorParams) 
    {
        this.bounds = bounds;
        this.root = new Node(bounds);
        this.meshGenerator = new MeshGenerator();
        this.simplexNoiseGenerator = simplexNoiseGenerator;
        this.terrainGeneratorParams = terrainGeneratorParams;
        
        this.shaderMaterial = this.generateMaterial(1, 100, true);
    }

    public insert(position2D: THREE.Vector2, scene: THREE.Scene) {
        this.insertAtNode(this.root, position2D, scene);
    }

    private insertAtNode(node: Node, position2D: THREE.Vector2, scene: THREE.Scene) {
        // calculate distance to node
        let cameraDistanceToNode = node.bounds.getCenter(new THREE.Vector2()).distanceTo(position2D);

        let nodeSize = node.bounds.getSize(new THREE.Vector2()).x;

        if(cameraDistanceToNode < nodeSize && nodeSize > this.MIN_NODE_SIZE) {
            if(node.children.length == 0)
                node.split();

            node.children.forEach(childNode => {
                this.insertAtNode(childNode, position2D, scene);
            });
        }
        else {
            node.children.forEach(x => x.merge());
            node.merge();   
            //if(node.mesh != null)
            //this.generateMesh(node, scene);         
        }
    }

    updateMeshes(scene: THREE.Scene): void {
        this.generateMesh(this.root, scene);
    }

    private getChildren(): Node[] {
        return this.root.getChildren();
    }
    
    public getTotalNodeCount(): number {
        return this.root.getTotalNodeCount();
    }

    public generateMesh(node: Node, scene: THREE.Scene) {
        if(node.children.length > 0){
            
            if(node.mesh != null)
                node.mesh?.disposeMeshAndRemoveFromScene(scene);            

            node.children.forEach(x => {
                this.generateMesh(x, scene);
            })
            return;
        }
        else {
            if(node.mesh != null)
                return;

            let mesh = this.meshGenerator.createPlaneMeshFromNoise(this.bounds.min.x, this.bounds.min.y,
                this.simplexNoiseGenerator, this.bounds.getSize(new THREE.Vector2()).x, 256, this.shaderMaterial, 0, this.terrainGeneratorParams);

            mesh.receiveShadow = true;
            mesh.position.setX(this.bounds.min.x);
            mesh.position.setZ(this.bounds.min.y);
            //mesh.visible = false;

            node.mesh = mesh;
            scene.add(node.mesh);
        }
    }
    
    private generateMaterial(repeats: number, heightFactor: number, isWireframe: boolean): THREE.Material {

        const loader = new THREE.TextureLoader();
  
        const texture1 = this.loadAndConfigureTexture(loader, "assets/sand.png", repeats);                
        const texture2 = this.loadAndConfigureTexture(loader, "assets/tileable_grass_00.png", repeats);        
        const texture3 = this.loadAndConfigureTexture(loader, "assets/stone.png", repeats);        
        const texture4 = this.loadAndConfigureTexture(loader, "assets/stone.png", repeats);
        const texture5 = this.loadAndConfigureTexture(loader, "assets/snow.png", repeats);
  
        return new THREE.ShaderMaterial({
            uniforms: {
              lowTexture: { value: texture1},
              lowMidTexture: { value: texture2 },
              midTexture: { value: texture3 },
              highMidTexture: { value: texture4 },
              highTexture: { value: texture5 },
              repeats: { value: repeats },
              heightFactor: { value: heightFactor },
              //fogColor: { value: this.fog?.color ?? new THREE.Color('black') },
              //fogNear: { value: (this.fog as THREE.Fog)?.near ?? 10000 },
              //fogFar: { value: (this.fog as THREE.Fog)?.far ?? 10000 },
            },
            //fog: this.gameConfig.useFog,
            vertexShader: this.vertexShader4(),
            fragmentShader: this.fragmentShader4(),
            wireframe: isWireframe
        });
    }

    private loadAndConfigureTexture(loader: THREE.TextureLoader, asset: string, repeats: number): THREE.Texture
    {
        const texture = loader.load(asset);                
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.LinearFilter;
        //texture.minFilter = THREE.NearestMipMapLinearFilter;
        //texture.anisotropy = 16;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.repeat.set(repeats, repeats);
        texture.needsUpdate = true;

        return texture;
    }
    
    private vertexShader4() {
      return `
      varying vec3 vPosition;
      varying vec2 vUv;
      varying float vFogDepth;

      void main() {
        vPosition = position;
        vUv = uv;
        
        // Calculate model-view position (required for fog)
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

        // Pass the fog depth (distance from the camera)
        vFogDepth = -mvPosition.z;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
      `
    }

    private fragmentShader4() {
      return `

      uniform sampler2D lowTexture;
      uniform sampler2D lowMidTexture;
      uniform sampler2D midTexture;
      uniform sampler2D highMidTexture;
      uniform sampler2D highTexture;      
      
      uniform float repeats;
      uniform float heightFactor;

      uniform vec3 fogColor;
      uniform float fogNear;
      uniform float fogFar;

      varying vec3 vPosition;      
      varying vec2 vUv;
      varying float vFogDepth;

      void main() {
        float height = vPosition.z / heightFactor; // Normalize height to 0.0 - 1.0

        vec2 repeatedUv = vUv * repeats; // Adjust the number of repetitions here

        vec4 lowColor = texture2D(lowTexture, repeatedUv);
        vec4 lowMidColor = texture2D(lowMidTexture, repeatedUv);
        vec4 midColor = texture2D(midTexture, repeatedUv);
        vec4 highMidColor = texture2D(highMidTexture, repeatedUv);
        vec4 highColor = texture2D(highTexture, repeatedUv);

        vec4 color = mix(lowColor, lowMidColor, smoothstep(0.0, 0.1, height));
        color = mix(color, midColor, smoothstep(0.1, 0.5, height));
        color = mix(color, highMidColor, smoothstep(0.5, 0.75, height));
        color = mix(color, highColor, smoothstep(0.75, 1.0, height));

        gl_FragColor = color;

        
        //// Fog factor calculation (standard linear fog)
        //float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);

        //// Mix base color with fog color based on fog factor
        //gl_FragColor = vec4(mix(color.rgb, fogColor, fogFactor), color.a);
      }
        `
    }
}

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

    public split(): void {

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

    public merge(): void {
        // fast
        //this.children.forEach(x => x.merge());                
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
}