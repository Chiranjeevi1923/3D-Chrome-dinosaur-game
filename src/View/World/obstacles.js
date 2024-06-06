import * as THREE from 'three';
import View from '../View';
import { math } from '../Utils/math';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export const obstacles = (() => {
    class CactusTree {
        constructor(view, position) {
            this.view = view
            this.scene = this.view.scene

            // Inital position
            this.position = position;
            this.velocity = 0.3;

            // Box model
            this.mesh = null;
            this.obstacleBox = new THREE.Box3();

            // Uncomment to see the bounding box of the obstacle
            // const boxHelper = new THREE.Box3Helper(this.obstacleBox, 0xffff00);
            // this.scene.add(boxHelper);

            // Loading manager
            this.loadingManager = this.view.loadingManager;

            // Setup
            this.loadModel();
        }

        loadModel() {
            const textureLoader = new THREE.TextureLoader(this.loadingManager);
            textureLoader.setPath('models/Desert/Textures/');
            const texture = textureLoader.load('Ground.png');

            const loader = new FBXLoader(this.loadingManager);
            loader.setPath('models/Desert/FBX/');
            loader.load('Cactus3.fbx', (fbx) => {
                fbx.scale.setScalar(0.01);

                this.mesh = fbx;
                this.scene.add(this.mesh);

                fbx.traverse(c => {
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
                                texture.encoding = THREE.sRGBEncoding;
                                m.map = texture;
                            }
                            m.specular = new THREE.Color(0x000000);
                        }
                    }

                    c.castShadow = true;
                    c.receiveShadow = true;
                });
            });
        }

        updatePosition() {
            if (!this.mesh) {
                return;
            }

            this.position.x -= this.velocity;
            if (this.position.x < -50) {
                this.position.x = 250;
            }

            this.mesh.position.copy(this.position);

            // Update bounding box of a every obstacle object
            this.obstacleBox.setFromObject(this.mesh);
        }
    }

    class Obstacle {
        constructor(view) {
            this.obstacles = [];
            this.obstaclesCount = 15;
            this.firstObstaclePosition = 100;
            this.minGap = 22.5;
            this.gap = {
                min: 5,
                max: 20
            };

            this.view = view;
            this.scene = this.view.scene;
            this.time = this.view.time;

            this.addResetObstacles();
        }

        addResetObstacles(isReset = false) {
            for (let i = 0; i < this.obstaclesCount; i++) {
                const positionX = i === 0
                    ? this.firstObstaclePosition
                    : (this.firstObstaclePosition + (this.minGap * i) + math.rand_int(this.gap.min, this.gap.max));
                const position = new THREE.Vector3(
                    positionX,
                    0,
                    0
                );
                if (isReset) {
                    this.obstacles[i].position = position;
                } else {
                    const obstacle = new CactusTree(this.view, position);
                    this.obstacles.push(obstacle);
                }
            }
        }

        resetObstacles() {
            console.log('reset obstacles', this.obstacles);
            for (let i = 0; i < this.obstaclesCount; i++) {
                const positionX = i === 0
                    ? this.firstObstaclePosition
                    : (this.firstObstaclePosition + (this.minGap * i) + math.rand_int(this.gap.min, this.gap.max));
                const position = new THREE.Vector3(
                    positionX,
                    0,
                    0
                );
                this.obstacles[i].position = position;
            }
        }

        updateObstacles() {
            for (let o of this.obstacles) {
                o.updatePosition();
            }
        }

        getObsctacles() {
            return this.obstacles;
        }
    }

    return {
        Obstacle
    }
})();