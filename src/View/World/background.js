import View from "../View"
import * as THREE from 'three';

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { math } from "../Utils/math";

export const background = (() => {
    class Cloud {
        constructor(view) {
            this.view = view
            this.scene = this.view.scene
            this.time = this.view.time
            this.position = new THREE.Vector3()
            this.quaternion = new THREE.Quaternion()
            this.scale = 1.0
            this.mesh = null

            // Cloud variables
            this.velocity = math.rand_range(0.01, 0.3)

            // Loding manager
            this.loadingManager = this.view.loadingManager;

            this.loadModel()
        }

        loadModel() {
            const loader = new GLTFLoader(this.loadingManager);
            loader.setPath('models/Clouds/GLTF/');
            loader.load(`Cloud${math.rand_int(1, 3)}.glb`, (gltf) => {
                this.mesh = gltf.scene;
                this.scene.add(this.mesh);

                this.position.x = math.rand_range(0, 200);
                this.position.y = math.rand_range(40, 80);
                this.position.z = math.rand_range(300, -200);
                this.scale = math.rand_range(0.5, 8);

                const q = this.quaternion.setFromAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    math.rand_range(0, 360)
                );
                this.quaternion.copy(q);

                this.mesh.traverse(c => {
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
                            m.emissive = new THREE.Color(0xC0C0C0);
                        }
                    }

                    c.castShadow = true;
                    c.receiveShadow = true;
                });
            });

        }

        updateCloud() {
            if (!this.mesh) {
                return;
            }

            this.position.x -= this.velocity;
            if (this.position.x < -100) {
                this.position.x = 300;
            }

            this.mesh.position.copy(this.position);
            this.mesh.quaternion.copy(this.quaternion);
            this.mesh.scale.setScalar(this.scale);
        }
    }

    class Crap {
        constructor(view) {
            this.view = view
            this.scene = this.view.scene
            this.time = this.view.time
            this.position = new THREE.Vector3()
            this.quaternion = new THREE.Quaternion()
            this.scale = 1.0
            this.mesh = null

            // Crap variables
            this.velocity = 0.05

            // Loding manager
            this.loadingManager = this.view.loadingManager;

            this.loadModels();
        }

        loadModels() {
            const assets = [
                ['BigPalmTree.glb', 'PalmTree.png', 5],
                ['SmallPalmTree.glb', 'PalmTree.png', 2.5],
                // ['Skull.glb', 'BonesTexture.png', 1],
                ['Scorpion.glb', 'Ground.png', 1],
                ['Pyramid.glb', 'Ground.png', math.rand_int(6, 9)],
                ['Monument.glb', 'Ground.png', 5],
                ['Cactus1.glb', 'Ground.png', 5],
                ['Cactus2.glb', 'Ground.png', 5],
                // ['Cactus3.glb', 'Ground.png', 5],
            ]

            const [asset, textureName, scale] = assets[math.rand_int(0, assets.length - 1)];

            const textureLoader = new THREE.TextureLoader(this.loadingManager);
            const texture = textureLoader.load(`models/Desert/Textures/${textureName}`);
            texture.encoding = THREE.sRGBEncoding;

            const loader = new GLTFLoader(this.loadingManager);
            loader.setPath('models/Desert/GLTF/');
            loader.load(asset, (glb) => {
                this.mesh = glb.scene;
                this.scene.add(this.mesh);

                this.position.x = math.rand_range(0, 200);
                this.position.z = math.rand_range(400, -400);
                this.scale = scale;

                const q = this.quaternion.setFromAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    math.rand_range(0, 360)
                );
                this.quaternion.copy(q);

                this.mesh.traverse(c => {
                    if (c.geometry) {
                        c.geometry.computeBoundingBox();
                    }

                    let materials = c.material;
                    if (!(c.material instanceof Array)) {
                        materials = [c.material];
                    }
                    for (let m of materials) {
                        if (m) {
                            if (texture) {
                                m.map = texture;
                            }
                            m.specular = new THREE.Color(0x000000);
                        }
                    }
                    c.castShadow = true;
                    c.receiveShadow = true;
                })
            })

        }

        updateCrap() {
            if (!this.mesh) {
                return;
            }

            this.position.x -= this.velocity;
            if (this.position.x < -100) {
                this.position.x = 300;
            }

            this.mesh.position.copy(this.position);
            this.mesh.quaternion.copy(this.quaternion);
            this.mesh.scale.setScalar(this.scale);
        }
    }

    class Background {
        constructor() {
            this.view = new View()
            this.scene = this.view.scene
            this.time = this.view.time
            this.clouds = []
            this.cloudCount = 30

            this.crapObjects = []
            this.crapObjectCount = 50

            this.createClouds()
            this.createCrapObjects()
        }

        createClouds() {
            for (let i = 0; i < this.cloudCount; i++) {
                const cloud = new Cloud(this.view);
                this.clouds.push(cloud);
            }
        }

        createCrapObjects() {
            for (let i = 0; i < this.crapObjectCount; i++) {
                const crap = new Crap(this.view);
                this.crapObjects.push(crap);
            }
        }

        updateBackground() {
            for (let c of this.clouds) {
                c.updateCloud();
            }

            for (let c of this.crapObjects) {
                c.updateCrap();
            }
        }
    }

    return {
        Background
    }
})();