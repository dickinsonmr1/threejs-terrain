import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { CameraRig } from '../shared/cameraRig';

// https://threejs.org/examples/#misc_controls_pointerlock

export class PointerLockControlsManager {

    private pointerLockControls?: PointerLockControls;
    constructor() {
            
    }
    initializePointerLock(cameraRig: CameraRig, document: Document): PointerLockControls | null {

        const blocker = document.getElementById( 'blocker' );
        const instructions = document.getElementById( 'instructions' );

        const isPointerLockSupported = 
            'requestPointerLock' in document.body || 
            'webkitRequestPointerLock' in document.body || 
            'mozRequestPointerLock' in document.body;

        if (!isPointerLockSupported)
            return null;

        let pointerLockControls = new PointerLockControls( cameraRig.getCamera(), document.body );
        let isPointerLockRequested = false;
        
        instructions!.addEventListener( 'click', async () => {
            if(!isPointerLockRequested) {//} && !touchScreenRequested) {
            try {
                isPointerLockRequested = true;
                pointerLockControls.lock();

                setTimeout(() => {
                isPointerLockRequested = false;
                }, 2000);
            }
            catch(error) {
                console.log('Error locking pointer:', error);
            }
            }
        });

        pointerLockControls.addEventListener( 'lock', async () => {
            instructions!.style.display = 'none';
            blocker!.style.display = 'none';
        });
        
        pointerLockControls.addEventListener( 'unlock', async () => {
            blocker!.style.display = 'block';
            instructions!.style.display = '';
        });
            
        // Handle pointer lock errors
        document.addEventListener('pointerlockerror', async (event) => {
            console.log('Pointer lock failed:', event);
        });

        this.pointerLockControls = pointerLockControls;
        return pointerLockControls;
    }

    isPointerLockActive(): boolean {
        return this.pointerLockControls?.isLocked ?? false;
    }
}