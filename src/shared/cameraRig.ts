import * as THREE from 'three'

export class CameraRig {
    pitchObject: THREE.Object3D;
    yawObject: THREE.Object3D;
    
    sensitivityX: number = 2.5;
    sensitivityY: number = 2.0;
    deadzone: number = 0.1;
    
    yaw: number = 0;
    pitch: number = 0;
    lookX: number = 0;
    lookY: number = 0;

    constructor(scene: THREE.Scene, public camera: THREE.Camera) {
        this.pitchObject = new THREE.Object3D();
        this.yawObject = new THREE.Object3D();
        
        this.yawObject.add(this.pitchObject);
        this.pitchObject.add(camera);
        scene.add(this.yawObject);
    }
    
    private curve(v: number) {
      return v * Math.abs(v); // smoother near center
    }

    moveRig(direction: THREE.Vector3) {
        this.yawObject.position.add(direction);
        this.pitchObject.position.copy(this.yawObject.position);
        this.camera.position.copy(this.yawObject.position);
    }

    update(delta: number) {
        
        // Apply deadzone
        let x = Math.abs(this.lookX) < this.deadzone ? 0 : this.lookX;
        let y = Math.abs(this.lookY) < this.deadzone ? 0 : this.lookY;
    
        // Apply curve
        x = this.curve(x);
        y = this.curve(y);
    
        // FPS-style rotation
        this.yaw   -= x * this.sensitivityX * delta;
        //yaw += 1.0*delta;
        this.pitch -= y * this.sensitivityY * delta;
    
        // Clamp pitch
        const maxPitch = Math.PI / 2 - 0.01;
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
    
        // Apply to rig
        this.yawObject.rotation.y = this.yaw;
        this.pitchObject.rotation.x = this.pitch;
        //this.camera.rotation.y = this.yaw;
        //this.camera.rotation.x = this.pitch;
    }
}