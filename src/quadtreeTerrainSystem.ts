import * as THREE from "three";
import { QuadtreeNode } from "./quadtreeNode";
//import * as CANNON from 'cannon-es'

export class QuadtreeTerrainSystem {
    root: QuadtreeNode;
    scene: THREE.Scene;
    maxLevel: number;
    heightScale: number;

    totalTerrainSize: number;

    //body?: CANNON.Body;
    //private heightfieldShape!: CANNON.Heightfield;

    materials: THREE.Material[] = [];

    constructor(scene: THREE.Scene, size: number, maxLevel: number, dataArray2D: number[][], heightScale: number, isWireframe: boolean) { //world: CANNON.World
        this.scene = scene;

        this.totalTerrainSize = size;
        this.heightScale = heightScale;

        this.createMaterials(isWireframe);

        this.maxLevel = maxLevel;

        // Create the root node of the quadtree
        this.root = new QuadtreeNode(dataArray2D, 0, 0, size, 0, heightScale, this.totalTerrainSize, 4);
        
        this.root.createMesh(this.scene, this.materials[0]);
        //this.body = this.generateCannonHeightField(world, dataArray2D.length, dataArray2D.length, heightScale, dataArray2D, new THREE.Vector3(0, 0, -this.totalTerrainSize));            
    }

    // Recursively subdivide the entire quadtree initially (pass root tostart)
    buildFullQuadtree(node: QuadtreeNode, maxLOD: number): void {
        //const { size } = node.size;
        if (node.level > maxLOD) return; // Stop subdividing at the maximum level of detail

        node.subdivide();

        // Recursively subdivide the children
        if (node.children![0] != null) this.buildFullQuadtree(node.children![0], maxLOD);
        if (node.children![1]) this.buildFullQuadtree(node.children![1], maxLOD);
        if (node.children![2]) this.buildFullQuadtree(node.children![2], maxLOD);
        if (node.children![3]) this.buildFullQuadtree(node.children![3], maxLOD);
    }

    // Update quadtree based on camera position
    update(camera: THREE.Camera) {
        this.updateNode(this.root, camera);
    }

    // Recursive function to update nodes
    updateNode(node: QuadtreeNode, camera: THREE.Camera) {
        const distance = this.getCameraDistanceToNode(camera, node);

        // Subdivide or merge based on distance
        if (distance < node.size * 2 && node.level < this.maxLevel) {
            if (!node.isSubdivided()) {
                node.subdivide();
            }

            // Update child nodes recursively
            if (node.children) {
                node.children.forEach(child => this.updateNode(child, camera));
            }
        } else if (node.isSubdivided()) {
            this.merge(node);
        } else {
            // Create mesh if not subdivided
            node.createMesh(this.scene, this.materials[node.level]);
        }
    }

    // Merge node back into a single tile (removing children)
    merge(node: QuadtreeNode) {
        if (node.children) {
            node.children.forEach(child => {
                if (child.mesh) {
                    //this.scene.remove(child.mesh);
                    //child.mesh = null;
                    child.mesh.visible = false;
                    child.cylinderMesh!.visible = false;
                }
                this.merge(child);
            });
            node.children = null;
        }
    }

    // Calculate distance from the camera to the center of the node
    getCameraDistanceToNode(camera: THREE.Camera, node: QuadtreeNode): number {
        const nodeCenter = new THREE.Vector3(node.x + node.size / 2, 0, node.y + node.size / 2);
        /*const upperLeft = new THREE.Vector3(
            node.x + this.totalTerrainSize / 2 + node.size / 2,
            0,
            node.y + this.totalTerrainSize / 2 + node.size / 2);
        */
        let temp = new THREE.Vector3(camera.position.x, 0, camera.position.z);
        return temp.distanceTo(nodeCenter);
    }

    loadAndConfigureTexture(loader: THREE.TextureLoader, asset: string, repeats: number): THREE.Texture
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

    /*
    generateCannonHeightField(world: CANNON.World, sizeX: number, sizeZ: number, heightFactor: number, dataArray2D: number[][] = [], offset: THREE.Vector3): CANNON.Body {           

        var matrix: number[][] = [];

        if(dataArray2D.length > 0) {
          //matrix = dataArray2D;
          matrix = dataArray2D.map(row => row.slice());
          for (let i = 0; i < sizeX; i++) {
            for (let j = 0; j < sizeZ; j++) {
              matrix[i][j] *= heightFactor; // scale by heightFactor
            }
          }
        }
        
        const groundMaterial = new CANNON.Material('ground');
        this.heightfieldShape = new CANNON.Heightfield(matrix, {
          elementSize: 1
        });

        const heightfieldBody = new CANNON.Body({ mass: 0, material: groundMaterial, isTrigger: false });
        heightfieldBody.addShape(this.heightfieldShape);

        heightfieldBody.position.set(
          -(sizeX * this.heightfieldShape.elementSize) / 2,
          0,
          (sizeZ * this.heightfieldShape.elementSize) / 2
        );
        heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, -Math.PI / 2);
        heightfieldBody.position.set(
          heightfieldBody.position.x + offset.x,
          heightfieldBody.position.y + offset.y,
          heightfieldBody.position.z + offset.z
        );

        world.addBody(heightfieldBody);

        heightfieldBody.addEventListener('collide', (event: any) => {
          let body = <CANNON.Body>event.body;
          //console.log('body collided with terrain', event);
        });

        return heightfieldBody;
    }
    */

    createMaterials(isWireframe: boolean) {

        const loader = new THREE.TextureLoader();

        let textureLOD0 = this.loadAndConfigureTexture(loader, "assets/stone 3.png", 1);
        let textureLOD1 = this.loadAndConfigureTexture(loader, "assets/stone 3.png", 2);
        let textureLOD2 = this.loadAndConfigureTexture(loader, "assets/stone 3.png", 4);
        let textureLOD3 = this.loadAndConfigureTexture(loader, "assets/stone 3.png", 8);
        let textureLOD4 = this.loadAndConfigureTexture(loader, "assets/stone 3.png", 16);
        let textureLOD5 = this.loadAndConfigureTexture(loader, "assets/stone 3.png", 32);

        let displacementScale = 50;
        // lowest level of detail
        let material1 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0xff0000,
            //displacementMap: displacementMap,
            //displacementScale: displacementScale,
            map: textureLOD0
        });

        let material2 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0x00ff00,
            //displacementMap: displacementMap,
            //displacementScale: displacementScale,
            map: textureLOD1
        });

        let material3 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0x0000ff,
            //displacementMap: displacementMap,
            //displacementScale: displacementScale,
            map: textureLOD2
        });

        let material4 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0xffff00,
            //displacementMap: displacementMap,
            //displacementScale: displacementScale,
            map: textureLOD3
        });

        let material5 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0xff00ff,
            //displacementMap: displacementMap,
            //displacementScale: displacementScale,
            map: textureLOD4
        });

        // highest level of detail
        let material6 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0xffffff,
            //displacementMap: displacementMap,
            //displacementScale: displacementScale,
            map: textureLOD5
        });

        this.materials.push(material1);
        this.materials.push(material2);
        this.materials.push(material3);
        this.materials.push(material4);
        this.materials.push(material5);
        this.materials.push(material6);

    }
}