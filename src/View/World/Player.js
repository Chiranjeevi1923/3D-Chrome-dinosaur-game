import View from "../View";
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { CONSTANT } from "../Utils/Consants";
import { obstacles } from "./obstacles";
import Emitter from "../Utils/Emitter";

export class Player extends Emitter {
    constructor(view) {
        super();
        
        this.view = view;
        this.time = this.view.time;
        this.world = this.view.world;
        this.scene = this.view.scene
        
        this.mesh = null;
        this.playerBox = new THREE.Box3();
        this.playerBox.expandByScalar(0.5);
        // Uncomment to see the bounding box of the dainosaur
        // const boxHelper = new THREE.Box3Helper(this.playerBox, 0xffff00);
        // this.scene.add(boxHelper);
        
        this.initalPosition = {
            x: CONSTANT.dainosaurPosition.x,
            y: CONSTANT.dainosaurPosition.y,
            z: CONSTANT.dainosaurPosition.z
        };
        this.position = new THREE.Vector3(0, 0, 0);
        
        // Variables for player animation
        this.velocity = 0.001522;
        this.jumpDirection = 0; // 0: not jumping, 1: jumping up, 2: falling down
        this.jumpHeight = 5; // Height of the jump
        this.jumpSpeed = 0.25; // Speed of the jump
        this.fallSpeed = 0.3; // Speed of the fall
        this.maxJump = 5;
        this.score = 0;

        // Loading manager
        this.loadingManager = this.view.loadingManager;
        
        this.loadModel()
        this.addKeyEvents()

        this.scoreSelector = document.querySelector('.score-container .score-text');
    }

    loadModel() {
        const loader = new FBXLoader(this.loadingManager);
        loader.setPath('models/Dinosaur/FBX/');
        loader.load('Parasaurolophus.fbx', (fbx) => {
            fbx.scale.setScalar(0.0025);
            fbx.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
            fbx.position.set(this.initalPosition.x, this.initalPosition.y, this.initalPosition.z);
            this.mesh = fbx;
            this.scene.add(fbx);
            
            fbx.traverse(c => {
                let materials = c.material;
                if (!(c.material instanceof Array)) {
                    materials = [c.material];
                }

                for (let m of materials) {
                    if (m) {
                        m.specular = new THREE.Color(0x000000);
                        m.color.offsetHSL(1, 0.02, 0.25);
                    }
                }

                c.castShadow = true;
                c.receiveShadow = true;
            });
            const mixer = new THREE.AnimationMixer(fbx);
            this.mixer = mixer;
            for (let i = 0; i < fbx.animations.length; i++) {
                if (fbx.animations[i].name.includes('Run')) {
                    const clip = fbx.animations[i];
                    const action = mixer.clipAction(clip);
                    action.play();
                }
            }

        });

    }

    addKeyEvents() {
        this.keys = {
            space: false
        }
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    }

    onKeyDown(e) {
        switch (e.key) {
            case ' ':
                this.keys.space = true
                break;
        }
    }

    onKeyUp(e) {
        switch (e.key) {
            case ' ':
                this.keys.space = false
                break;
        }
    }

    updatePlayer(elapsedTime) {
        if (!this.mesh) {
            return;
        }
        
        // Update the player bounding box
        this.playerBox.setFromObject(this.mesh);

        // Resize the player box to make collision detection more accurate
        this.playerBox.setFromCenterAndSize(
            new THREE.Vector3(
                this.mesh.position.x + 0.3,
                this.mesh.position.y + 0.65,
                this.mesh.position.z
            ),
            new THREE.Vector3(
                0.9,
                1.2,
                1
            )
        )

        if(this.mesh.position.y === this.initalPosition.y){
            this.mixer.update(this.time.delta * this.velocity);
        }
        
        if (this.keys.space) {
            this.jumpDirection = 1;
        }

        if (this.jumpDirection === 1) {
            this.mesh.position.y += this.jumpSpeed;
            if (this.mesh.position.y >= this.jumpHeight) {
                this.jumpDirection = 2;
            }
        } else if (this.jumpDirection === 2) {
            this.mesh.position.y -= this.fallSpeed;
            if (this.mesh.position.y <= this.initalPosition.y) {
                this.mesh.position.y = this.initalPosition.y;
                this.jumpDirection = 0;
            }
        }

        this.checkCollision();
    }

    checkCollision() {
        const cactusTrees = this.world.obstacles?.getObsctacles();
        if(cactusTrees && this.view.isCameraAnimationComplete) {
            for (let c of cactusTrees) {
                if (this.playerBox.intersectsBox(c.obstacleBox)) {
                    this.view.isGameOver = true;
                    this.event.emit('gameOver');
                }
            }
        }
    }

    updateScore() {
        this.score += 1 * 0.3;
        this.updateScoreOnBoard();
    }

    updateScoreOnBoard() {
        if(this.scoreSelector) {
            this.scoreSelector.innerHTML = Math.round(this.score);
        }
    }
    
    resetPlayer() {
        this.mesh.position.y === this.initalPosition.y;
    }
}