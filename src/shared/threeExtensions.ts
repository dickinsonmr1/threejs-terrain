import * as THREE from 'three';

// Extend the THREE.Group type
declare module 'three' {
  interface Group {
    disposeGroupAndRemoveFromScene(scene: THREE.Scene): void;
  }
}

// Extend the THREE.Group type
declare module 'three' {
    interface Mesh {
      disposeMeshAndRemoveFromScene(scene: THREE.Scene): void;
    }
  }

// Add the method to the THREE.Group prototype
THREE.Group.prototype.disposeGroupAndRemoveFromScene = function (
  this: THREE.Group,
  scene: THREE.Scene
): void {
    this.children.forEach(x => {
        if(x != null) {

            let mesh = x as THREE.Mesh;

            scene.remove(mesh);
            
            // Dispose of the geometry and material associated with the mesh
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                // If the material is an array (e.g., for MultiMaterial), dispose each one
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(material => material.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
            this.remove(x);
        }
    });   
    this.clear();
    scene.remove(this);
};

// Add the method to the THREE.Mesh prototype
THREE.Mesh.prototype.disposeMeshAndRemoveFromScene = function (
    this: THREE.Mesh,
    scene: THREE.Scene
  ): void {
      
    scene.remove(this);
    
    // Dispose of the geometry and material associated with the mesh
    if (this.geometry) this.geometry.dispose();
    if (this.material) {
        // If the material is an array (e.g., for MultiMaterial), dispose each one
        if (Array.isArray(this.material)) {
            this.material.forEach(material => material.dispose());
        } else {
            this.material.dispose();
        }
    }
};