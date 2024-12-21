import * as THREE from 'three'
import { Sky, Water } from 'three/examples/jsm/Addons.js';
import { SkyType } from '../shared/skyType';
import { QuadTree } from './quadtree';
import { TerrainGeneratorParams } from '../shared/terrainGeneratorParams';
import { SimplexNoiseGenerator } from '../shared/simplexNoiseGenerator';
import { VegetationMeshGenerator } from './vegetationMeshGenerator';
import { PrecipitationSystem, PrecipitationType } from './precipitationSystem';

export default class GameScene extends THREE.Scene {

    skyTexture!: THREE.Texture;
    sky!: Sky;
    water!: Water;
    quadTree!: QuadTree;
    camera: THREE.Camera;
    totalNodes: number = 0;

    terrainGeneratorParams: TerrainGeneratorParams;
    simplexNoiseGenerator: SimplexNoiseGenerator;
    vegetationMeshGenerator: VegetationMeshGenerator;

    precipitationSystem: PrecipitationSystem;

    clock: THREE.Clock = new THREE.Clock();
    
    constructor(camera: THREE.Camera) {
        super();

        this.camera = camera;

        this.terrainGeneratorParams = new TerrainGeneratorParams(1100, 6, 1.8, 4.5, 300, 0.71);
        this.simplexNoiseGenerator = new SimplexNoiseGenerator(this.terrainGeneratorParams)
        this.vegetationMeshGenerator = new VegetationMeshGenerator(this, this.simplexNoiseGenerator);

        this.addSkybox();
        this.addShaderSky();
        this.addTerrain();
        this.addWater();
        this.addLights();
        
        this.addVegetation();         
        
        this.precipitationSystem = new PrecipitationSystem(this, 1000, PrecipitationType.Rain, 1);
    }

    public switchSky(skyType: SkyType): void {
        if(skyType == SkyType.Shader) {
            this.sky.visible = true;
            this.background = null;          
          }
          else {
            this.sky.visible = false;
            this.background = this.skyTexture;
          }
    }

    private addSkybox() {

        const textureLoader = new THREE.TextureLoader();
        this.skyTexture = textureLoader.load(
          'assets/industrial_sunset_puresky.jpg',
          () => {
        
              this.skyTexture.mapping = THREE.EquirectangularReflectionMapping;
              this.skyTexture.colorSpace = THREE.SRGBColorSpace;

              let scene = this as THREE.Scene;
              scene.background = this.skyTexture;
          }  
        );
    }

    private addShaderSky() {

        this.sky = new Sky();
        this.sky.scale.setScalar( 450000 );
        
        const phi = THREE.MathUtils.degToRad( 90 );
        const theta = THREE.MathUtils.degToRad( 180 );
        const sunPosition = new THREE.Vector3().setFromSphericalCoords( 1, phi, theta );
        
        this.sky.material.uniforms.sunPosition.value = sunPosition;
        
        this.add( this.sky );
        
    }

    private addWater() {

        const waterGeometry = new THREE.PlaneGeometry( 100000, 100000 );
        this.water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load( 'assets/waternormals.jpg', function ( texture ) {
        
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        
                } ),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                //fog: this.fog !== undefined
            }
        );
        this. water.rotation.x = - Math.PI / 2;
        this.water.position.y = 5.01;
        //water.material.polygonOffset = true;
        //water.material.polygonOffsetFactor = -1; // Push back slightly
        //water.material.polygonOffsetUnits = -1;
        this.add( this.water );
    }

    private addLights(): void {
        
        let light2 = new THREE.DirectionalLight(0x808080, 0.8);
        light2.position.set(-100, 100, -100);
        light2.target.position.set(0, 0, 0);
        light2.castShadow = true;
        this.add(light2);

        let light3 = new THREE.DirectionalLight(0x404040, 0.8);
        light3.position.set(100, 100, -100);
        light3.target.position.set(0, 0, 0);
        light3.castShadow = true;
        this.add(light3);
    }

    private addTerrain() {
       
        this.quadTree = new QuadTree(
            new THREE.Box2(new THREE.Vector2(-50000, -50000), new THREE.Vector2(50000, 50000)), // world bounds
            this.simplexNoiseGenerator,
            this.vegetationMeshGenerator,
            this.terrainGeneratorParams,
            500, // minimum chunk size
            32, // vertices per chunk side
            100, // height factor
            false, // isWireframe
        );
          
        this.quadTree.insert(new THREE.Vector2(this.camera.position.x, -this.camera.position.z), this);
        this.quadTree.updateMeshes(this);
    }

    private addVegetation() {
        
        // add vegetation
        const geometry = new THREE.BoxGeometry(1, 3, 1);
        const material = new THREE.MeshStandardMaterial({color: 0x00ff00});

        const mesh1 = new THREE.Mesh(geometry, material);
        let boxPositionY = this.simplexNoiseGenerator.getHeightFromNoiseFunction(0, 0);

        mesh1.position.set(0, boxPositionY, 0);
        this.add(mesh1);

        // TODO: generate by node
    }

    public update(lockCameraToTerrain: boolean): void {
                
        this.quadTree.insert(new THREE.Vector2(this.camera.position.x, -this.camera.position.z), this);
        this.quadTree.updateMeshes(this);
        this.totalNodes = this.quadTree.getTotalNodeCount();

        if(lockCameraToTerrain) {

            let newCameraY = this.simplexNoiseGenerator.getHeightFromNoiseFunction(this.camera.position.x, -this.camera.position.z) + 2;
            this.camera.position.setY(newCameraY);
        }

        if(this.water !== null)    
            this.water.material.uniforms[ 'time' ].value += 0.5 / 60.0;

        this.precipitationSystem.animateRain(this.clock);
    }
}