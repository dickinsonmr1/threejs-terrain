import * as THREE from 'three'
import { Node } from './node';
import { MeshGenerator } from '../shared/meshGenerator';
import { SimplexNoiseGenerator } from '../02-chunk/simplexNoiseGenerator';
import { TerrainGeneratorParams } from '../shared/terrainGeneratorParams';
import '../shared/threeExtensions'; // Import the extensions

export class QuadTree {

    meshGenerator: MeshGenerator;
    root: Node;
    bounds: THREE.Box2;
    simplexNoiseGenerator: SimplexNoiseGenerator;

    shaderMaterial: THREE.Material;

    terrainGeneratorParams: TerrainGeneratorParams;

    MIN_NODE_SIZE: number = 50;
    verticesPerChunk: number;
    heightFactor: number;

    constructor(bounds: THREE.Box2, simplexNoiseGenerator: SimplexNoiseGenerator, terrainGeneratorParams: TerrainGeneratorParams, minimumNodeSize: number, verticesPerChunk: number, heightFactor: number) 
    {
        this.bounds = bounds;
        this.root = new Node(bounds);
        this.meshGenerator = new MeshGenerator();
        this.simplexNoiseGenerator = simplexNoiseGenerator;
        this.terrainGeneratorParams = terrainGeneratorParams;
        this.MIN_NODE_SIZE = minimumNodeSize;

        this.verticesPerChunk = verticesPerChunk;

        this.heightFactor = heightFactor;
        
        this.shaderMaterial = this.generateMaterial(4, heightFactor, false);
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
                node.split(scene);

            node.children.forEach(childNode => {
                this.insertAtNode(childNode, position2D, scene);
            });
        }
        else {
            //node.children.forEach(x => x.merge(scene));

            if(node.children.length > 0) {
                node.merge(scene);   
                //if(node.mesh != null)
                //this.generateMesh(node, scene);         
            }
        }
    }
    
    private getChildren(): Node[] {
        return this.root.getChildren();
    }
    
    public getTotalNodeCount(): number {
        return this.root.getTotalNodeCount();
    }

    public updateMeshes(scene: THREE.Scene): void {
        this.generateMesh(this.root, scene);
    }

    private generateMesh(node: Node, scene: THREE.Scene) {
        if(node.children.length > 0){
            
            //if(node.mesh != null)        
            node.children.forEach(x => {
                //if(!x.mesh)
                this.generateMesh(x, scene);
            });

            if(node.mesh != null)
                node.mesh!.visible = false;
            //node.mesh?.disposeMeshAndRemoveFromScene(scene);            
            return;
        }
        else {
            if(!node.mesh) {
                //if(node.mesh != null)
                    //return;

                //node.mesh!.disposeMeshAndRemoveFromScene(scene);                                

                let nodeSize = node.bounds.getSize(new THREE.Vector2()).x;
                //let mesh = this.meshGenerator.createPlaneMeshFromNoise(node.bounds.min.x, node.bounds.min.y,
                let mesh = this.meshGenerator.createPlaneMeshFromNoise(node.bounds.getCenter(new THREE.Vector2()).x, node.bounds.getCenter(new THREE.Vector2()).y,
                //let mesh = this.meshGenerator.createPlaneMeshFromNoise(node.bounds.max.x, node.bounds.max.y,
                    this.simplexNoiseGenerator, nodeSize, this.verticesPerChunk, this.shaderMaterial, 0, this.terrainGeneratorParams);

                mesh.receiveShadow = true;

                //let meshDrawOffset = node.bounds.min;
                let meshDrawOffset = node.bounds.getCenter(new THREE.Vector2());
                //let meshDrawOffset = node.bounds.max;

                mesh.position.setX(meshDrawOffset.x);
                mesh.position.setZ(-meshDrawOffset.y);

                //mesh.position.setX(meshDrawOffset.x / 2);
                //mesh.position.setZ(meshDrawOffset.y / 2);
                //mesh.visible = false;

                console.log(`Generating mesh for node: size ${nodeSize} // bounds min(${node.bounds.min.x}, ${node.bounds.min.y}) -> max(${node.bounds.max.x}, ${node.bounds.max.y}) // translating (${meshDrawOffset.x}, ${meshDrawOffset.y}) `);
                node.mesh = mesh;
                scene.add(node.mesh);
            }
            else {
                node.mesh!.visible = true;
            }
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
        //texture.needsUpdate = true;

        return texture;
    }
    
    private vertexShader4() {
      return `
      //#include <logdepthbuf_pars_vertex>

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

        //#include <logdepthbuf_vertex>
      }
      `
    }

    private fragmentShader4() {
      return `
      //#include <logdepthbuf_pars_fragment>

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

        //#include <logdepthbuf_fragment>
      }
        `
    }
}
