import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export const plane = (() => {

    class Plane {
        constructor(view) {
            this.view = view
            this.scene = this.view.scene
            this.time = this.view.time

            this.position = new THREE.Vector3(80, 50, 0);
            this.quaternion = new THREE.Quaternion();
            this.scale = 0.03;
            this.mesh = null;
            
            // Animation variables
            this.mixer = null;
            this.clips = [];
            this.animationVelocity = 0.005;

            this.planeVelocity = 0.3;

            // Loading manager
            this.loadingManager = this.view.loadingManager;

            this.loadModel();
        }

        loadModel() {
            const loader = new FBXLoader(this.loadingManager);
            loader.setPath('models/Plane/FBX/');
            loader.load('AirPlane.fbx', (fbx) => {
                this.mesh = fbx;
                this.scene.add(this.mesh);

                this.mixer = new THREE.AnimationMixer(fbx);
                this.clips = fbx.animations;


                this.mesh.scale.setScalar(this.scale);

                const q = this.quaternion.setFromAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    0
                );
                this.quaternion.copy(q);

                this.mesh.traverse(c => {
                    
                    // Make point light intesity 0
                    if(c instanceof THREE.PointLight) {
                        c.intensity = 0;
                    }
                    
                    if (c.geometry) {
                        c.geometry.computeBoundingBox();
                    }

                    let materials = c.material;
                    if (!(c.material instanceof Array)) {
                        materials = [c.material];
                    }

                    for (let m of materials) {
                        if (m) {
                            m.specular = new THREE.Color(0x000000);
                            m.emissive = new THREE.Color(0x000000);
                        }
                    }

                    c.castShadow = true;
                    c.receiveShadow = true;
                });

                // Play animation
                for (let i = 0; i < this.clips.length; i++) {
                    if(this.clips[i].name.includes('Cylinder.001|Cylinder.001Action')) { 
                        const clip = this.clips[i];
                        const action = this.mixer.clipAction(clip);
                        action.play();
                    }
                }
    
            });
        }

        updatePosition() {
            if (!this.mesh) {
                return;
            }

            this.mixer.update(this.time.delta * this.animationVelocity);

            this.position.z -= this.planeVelocity;
            if (this.position.z < -250) {
                this.position.z = 20;
            }

            this.mesh.position.copy(this.position);
            this.mesh.quaternion.copy(this.quaternion);
            this.mesh.scale.setScalar(this.scale);
        }
    }

    return {
        Plane
    }
})();