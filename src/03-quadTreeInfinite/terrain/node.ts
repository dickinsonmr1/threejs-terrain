import * as THREE from 'three'
import { SimplexNoiseGenerator } from '../../shared/simplexNoiseGenerator';
import { TreeGenerator } from './treeGenerator';

export class Node {

    children: Node[] = [];

    mesh?: THREE.Mesh;
    grassBillboards?: THREE.Points;

    grassInstancedMesh?: THREE.InstancedMesh;
    grassInstancedMeshMaterial?: THREE.ShaderMaterial;
    grassInstancedMeshCounter: number = 0;
    
    instancedTreeMesh?: THREE.InstancedMesh;
    helperLabel?: THREE.Sprite;
    helperMesh?: THREE.Mesh;
    
    constructor(private scene: THREE.Scene, public bounds: THREE.Box2, public lod: number) {

        let center = bounds.getCenter(new THREE.Vector2);

        /*
        if(lod > 5) {
            this.helperLabel = this.createTextLabel(`LOD ${lod} // (${center.x.toFixed(2)}, ${center.y.toFixed(2)})`, 'white', 512);
            this.helperLabel.position.set(center.x, 20, center.y).add(new THREE.Vector3(0, 0.5, 0));
            this.scene.add(this.helperLabel);
        }
        */
    }

    public split(scene: THREE.Scene): void {

        let center = this.bounds.getCenter(new THREE.Vector2);

        let upperLeft = new Node(scene, new THREE.Box2(
            new THREE.Vector2(this.bounds.min.x, this.bounds.min.y),
            center),
            this.lod + 1
        );

        let lowerLeft = new Node(scene, new THREE.Box2(
            new THREE.Vector2(this.bounds.min.x, center.y),
            new THREE.Vector2(center.x, this.bounds.max.y)),
            this.lod + 1
        );

        let upperRight = new Node(scene, new THREE.Box2(
            new THREE.Vector2(center.x, this.bounds.min.y),
            new THREE.Vector2(this.bounds.max.x, center.y)),
            this.lod + 1
        );

        let lowerRight = new Node(scene, new THREE.Box2(
            center,
            new THREE.Vector2(this.bounds.max.x, this.bounds.max.y)),
            this.lod + 1
        );
        
        this.children.push(upperLeft);
        this.children.push(lowerLeft);
        this.children.push(upperRight);
        this.children.push(lowerRight);

        console.log(`Splitting node (LOD ${this.lod}) with bounds: min(${this.bounds.min.x}, ${this.bounds.min.y}) -> max(${this.bounds.max.x}, ${this.bounds.max.y})`);
        console.log(`- Upper Left  :  min(${upperLeft.bounds.min.x}, ${upperLeft.bounds.min.y}) -> max(${upperLeft.bounds.max.x}, ${upperLeft.bounds.max.y})`);
        console.log(`- Lower Left  :  min(${lowerLeft.bounds.min.x}, ${lowerLeft.bounds.min.y}) -> max(${lowerLeft.bounds.max.x}, ${lowerLeft.bounds.max.y})`);
        console.log(`- Upper Right :  min(${upperRight.bounds.min.x}, ${upperRight.bounds.min.y}) -> max(${upperRight.bounds.max.x}, ${upperRight.bounds.max.y})`);
        console.log(`- Upper Left  :  min(${lowerRight.bounds.min.x}, ${lowerRight.bounds.min.y}) -> max(${lowerRight.bounds.max.x}, ${lowerRight.bounds.max.y})`);
        console.log(`----------------------------------------`);
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
            x.helperLabel?.disposeAndRemoveFromScene(scene);
            x.helperMesh?.disposeMeshAndRemoveFromScene(scene);
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
    
        geometry.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ));
    
        var material = new THREE.PointsMaterial( { size: 3, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: true, depthTest: true, depthWrite: false } );
        material.color.setHSL( 1.0, 0.3, 0.7, THREE.SRGBColorSpace );
    
        this.grassBillboards = new THREE.Points( geometry, material );
    }

    public generateGrassInstancedMesh(textureName: string, simplexNoiseGenerator: SimplexNoiseGenerator, bounds: THREE.Box2, yMin: number, yMax: number, maxCount: number) {
   
        const plane = new THREE.PlaneGeometry(5);

        const sprite = new THREE.TextureLoader().load( textureName );
        sprite.colorSpace = THREE.SRGBColorSpace;
    
        this.grassInstancedMeshMaterial = new THREE.ShaderMaterial({
            vertexShader: /* glsl */`            
            uniform sampler2D uTexture;
            uniform float uTime;
            uniform float uWindStrength;
            uniform vec2 uWindDirection;

            varying vec2 vUv;

            void main() {
                    vUv = uv;

                    // Billboard logic (face camera)
                    vec3 up = vec3(0.0, 1.0, 0.0);
                    vec3 cameraRight = vec3(modelViewMatrix[0][0], modelViewMatrix[1][0], modelViewMatrix[2][0]);
                    vec3 cameraForward = vec3(modelViewMatrix[0][2], modelViewMatrix[1][2], modelViewMatrix[2][2]);

                    // Vertex position before wind
                    vec3 pos = position;

                    // Wind sway — only affect upper part of blade
                    float swayFactor = smoothstep(0.0, 1.0, uv.y);
                    float sway = sin((instanceMatrix[3].x + uTime) * 0.5 + instanceMatrix[3].z * 0.2) * uWindStrength;
                    pos.x += sway * swayFactor * uWindDirection.x;
                    pos.z += sway * swayFactor * uWindDirection.y;

                    // Construct billboard position
                    vec3 instancePosition = instanceMatrix[3].xyz;
                    vec3 displaced =
                        cameraRight * pos.x +
                        up * pos.y +
                        cameraForward * pos.z +
                        instancePosition;
                        
                    gl_Position = projectionMatrix * viewMatrix * vec4(displaced, 1.0);

                    //vec4 worldPosition = instanceMatrix * vec4(position, 1.0);
                    //vec4 projectedPosition = projectionMatrix * modelViewMatrix * worldPosition;

                    //gl_Position = projectedPosition;
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
                uTexture: {value: sprite },
                uTime: { value: 0 },
                uWindStrength: { value: 0.5 },
                uWindDirection: { value: new THREE.Vector2(1.0, 0.5) },                    
            },
            transparent: true        
        });

        this.grassInstancedMesh = new THREE.InstancedMesh(plane.clone(), this.grassInstancedMeshMaterial, maxCount);
        
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

    public update(): void {
        if(this.grassInstancedMeshMaterial)
            this.grassInstancedMeshMaterial!.uniforms["uTime"].value += 0.2;
    }

    public generateDebugLabelAndMesh(): void {
        let center = this.bounds.getCenter(new THREE.Vector2);

        //if(this.lod > 5) {
            //this.helperLabel = this.createTextLabel(`LOD ${this.lod} // (${center.x.toFixed(2)}, ${center.y.toFixed(2)})`, 'white', 512);
            this.helperLabel = this.createTextLabel(`${this.lod}`, 'white', 2);
            //this.helperLabel = this.createTextLabel(`${this.lod}`, 'white', (9 - this.lod) * 1000);
            this.helperLabel.position.set(center.x, 200, -center.y).add(new THREE.Vector3(0, 0.5, 0));

            const geometry = new THREE.CylinderGeometry(5, 5, this.lod * 100);
            const material = new THREE.MeshStandardMaterial({color: 0xffff00, transparent: true, opacity: 0.2 });

            this.helperMesh = new THREE.Mesh(geometry, material);
            this.helperMesh.position.copy(this.helperLabel!.position);
            //this.scene.add(this.helperLabel);
        //}
    }
    
    private createTextLabel(text: string, color = 'white', scale = 0.5, fontSize = 64): THREE.Sprite {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        ctx.font = `${fontSize}px Arial`;

        // Measure the text width
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize * 1.2;

        // Resize canvas to fit text
        canvas.width = textWidth + 20;
        canvas.height = textHeight + 20;

        // Redefine font after resize (resizing clears canvas)
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw text centered
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        // Create texture and sprite
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);

        // Scale to make it readable in world space
        //const scale = 0.5; // Adjust this based on your scene scale
        sprite.scale.set(canvas.width * scale, canvas.height * scale, 1);

        return sprite;
    }
}