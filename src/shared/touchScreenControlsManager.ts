import nipplejs from 'nipplejs';
import * as THREE from 'three'
import { CameraRig } from '../shared/cameraRig';

export class TouchScreenControlsManager {
    
    /**
     *
     */
    constructor(cameraRig: CameraRig, settings: any, turboOn: boolean, velocity: THREE.Vector3, moveSpeed: number) {
        this.initializeLeftJoystick(turboOn, velocity, moveSpeed);
        this.initializeRightJoystick(cameraRig, settings);
    }
    
    private initializeLeftJoystick(turboOn: boolean, velocity: THREE.Vector3, moveSpeed: number) {
        let leftJoystickManager : nipplejs.JoystickManager = nipplejs.create({
            zone: document.getElementById('leftJoystickContainerDynamic')!,
            mode: 'static',
            dynamicPage: true,
            position: { left: '20%', bottom: '20%' },
            color: 'blue',
            restOpacity: 0.25
        });
        leftJoystickManager.on('move',  (data : nipplejs.EventData, output : nipplejs.JoystickOutputData) => {        
            //document.exitPointerLock();
            turboOn = true;
            if(output.vector.y > 0.1) {
                velocity.z = -moveSpeed * Math.abs(output.vector.y);
            }
            else if(output.vector.y < -0.1) {
                velocity.z = moveSpeed* Math.abs(output.vector.y);
            }
            else {
                velocity.z = 0;
            }
            
            if(output.vector.x > 0.1) {
                velocity.x = moveSpeed * Math.abs(output.vector.x);
            }
            else if(output.vector.x < -0.1) {
                velocity.x = -moveSpeed * Math.abs(output.vector.x);
            }
            else {
                velocity.x = 0;
            }
            console.log('leftJoystickManager on move');
        });
        
        leftJoystickManager.on('end',  () => {
            turboOn = false;
            velocity.x = 0;
            velocity.y = 0;
            velocity.z = 0
        });
        
        const leftZone = document.getElementById('rightJoystickContainerDynamic');
        if (leftZone) {
            leftZone.style.display = 'block';
        }
    }

    private initializeRightJoystick(cameraRig: CameraRig, settings: any) {
        let rightJoystickManager : nipplejs.JoystickManager = nipplejs.create({
            zone: document.getElementById('rightJoystickContainerDynamic')!,
            mode: 'static',
            dynamicPage: true,
            position: { right: '20%', bottom: '20%' },
            color: 'blue',
            restOpacity: 0.25
        });

        rightJoystickManager.on('move',  (data : nipplejs.EventData, output : nipplejs.JoystickOutputData) => {        
            if(!output.vector)
                return;            
            //document.exitPointerLock();
            
            cameraRig.lookX = output.vector.x * settings.gamepadLookSensitivityX; // -1 to 1
            cameraRig.lookY = output.vector.y * settings.gamepadLookSensitivityY; // -1 to 1
        });
        
        rightJoystickManager.on('end',  () => {
            cameraRig.lookX = 0;
            cameraRig.lookY = 0;
        });
        
        const rightZone = document.getElementById('rightJoystickContainerDynamic');
        if (rightZone) {
            rightZone.style.display = 'block';
        }
    }
}