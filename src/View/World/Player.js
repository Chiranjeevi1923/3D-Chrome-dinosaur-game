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
        this.scene = this.view.scene;

        this.mesh = null;
        this.playerBox = new THREE.Box3();

        this.initalPosition = {
            x: CONSTANT.dainosaurPosition.x,
            y: CONSTANT.dainosaurPosition.y,
            z: CONSTANT.dainosaurPosition.z
        };
        this.position = new THREE.Vector3(0, 0, 0);

        // --------------- Jump config ---------------
        this.velocity = 0.001522;
        this.jumpDirection = 0;      // 0: grounded, 1: rising, 2: falling
        this.jumpHeight = 5;      // world-units peak height
        this.jumpSpeed = 8;      // units per second (was frame-rate dependent)
        this.fallSpeed = 10;     // units per second, slightly faster for game-feel
        this.maxJumps = 1;      // set to 2 to enable double-jump
        this.jumpsUsed = 0;      // tracks jumps in the current airborne phase

        this.score = 0;

        // Loading manager
        this.loadingManager = this.view.loadingManager;

        this.loadModel();
        this.addKeyEvents();

        this.scoreSelector = document.querySelector('.score-container .score-text');
    }

    // ─────────────────────────────────────────────
    //  Model
    // ─────────────────────────────────────────────
    loadModel() {
        const loader = new FBXLoader(this.loadingManager);
        loader.setPath('models/Dinosaur/FBX/');
        loader.load('Parasaurolophus.fbx', (fbx) => {
            fbx.scale.setScalar(0.0025);
            fbx.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
            fbx.position.set(
                this.initalPosition.x,
                this.initalPosition.y,
                this.initalPosition.z
            );

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
                    const action = mixer.clipAction(fbx.animations[i]);
                    action.play();
                    this.runAction = action; // keep a ref so we can pause / resume
                }
            }
        });
    }

    // ─────────────────────────────────────────────
    //  Input — keyboard + touch/tap for mobile
    // ─────────────────────────────────────────────
    addKeyEvents() {
        this.keys = { space: false };

        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);

        // Touch support (Chrome dino works on mobile too)
        document.addEventListener('touchstart', (e) => this.onTouchStart(e), false);
    }

    onKeyDown(e) {
        if (e.key === ' ') {
            e.preventDefault();          // prevent page scroll
            this.keys.space = true;
            this.tryJump();
        }
    }

    onKeyUp(e) {
        if (e.key === ' ') {
            this.keys.space = false;
        }
    }

    onTouchStart(e) {
        e.preventDefault();
        this.tryJump();
    }

    // ─────────────────────────────────────────────
    //  Jump logic — single source of truth
    // ─────────────────────────────────────────────
    tryJump() {
        // Allow jump only when grounded OR within maxJumps while airborne
        if (this.jumpsUsed < this.maxJumps) {
            this.jumpDirection = 1;
            this.jumpsUsed++;
        }
    }

    // ─────────────────────────────────────────────
    //  Per-frame update
    // ─────────────────────────────────────────────
    updatePlayer(elapsedTime) {
        if (!this.mesh) return;

        // Delta time in seconds — makes physics frame-rate independent
        const dt = this.time.delta / 1000;

        // ── Bounding box (tighter than the full mesh for fair collisions) ──
        this.playerBox.setFromCenterAndSize(
            new THREE.Vector3(
                this.mesh.position.x + 0.3,
                this.mesh.position.y + 0.65,
                this.mesh.position.z
            ),
            new THREE.Vector3(0.9, 1.2, 1.0)
        );

        // ── Run animation only while grounded ──
        const isGrounded = this.mesh.position.y <= this.initalPosition.y;
        if (isGrounded && this.mixer) {
            this.mixer.update(this.time.delta * this.velocity);
        }

        // ── Vertical movement ──
        if (this.jumpDirection === 1) {
            // Rising
            this.mesh.position.y += this.jumpSpeed * dt;
            if (this.mesh.position.y >= this.jumpHeight) {
                this.mesh.position.y = this.jumpHeight; // clamp to peak
                this.jumpDirection = 2;
            }
        } else if (this.jumpDirection === 2) {
            // Falling
            this.mesh.position.y -= this.fallSpeed * dt;
            if (this.mesh.position.y <= this.initalPosition.y) {
                this.mesh.position.y = this.initalPosition.y; // snap to ground
                this.jumpDirection = 0;
                this.jumpsUsed = 0; // reset jump counter on landing
            }
        }

        this.checkCollision();
    }

    // ─────────────────────────────────────────────
    //  Collision
    // ─────────────────────────────────────────────
    checkCollision() {
        // Guard: don't keep firing after game is already over
        if (this.view.isGameOver) return;

        const cactusTrees = this.world.obstacles?.getObsctacles();
        if (!cactusTrees || !this.view.isCameraAnimationComplete) return;

        for (let c of cactusTrees) {
            if (this.playerBox.intersectsBox(c.obstacleBox)) {
                this.view.isGameOver = true;
                this.event.emit('gameOver');
                return; // no need to check further obstacles
            }
        }
    }

    // ─────────────────────────────────────────────
    //  Score
    // ─────────────────────────────────────────────
    updateScore() {
        // Multiply by delta so score is frame-rate independent
        const dt = this.time.delta / 1000;
        this.score += 9 * dt; // ~9 pts/sec feels close to the real Chrome dino
        this.updateScoreOnBoard();
    }

    updateScoreOnBoard() {
        if (this.scoreSelector) {
            // Zero-pad to 5 digits, exactly like the original Chrome dino
            this.scoreSelector.innerHTML = String(Math.floor(this.score)).padStart(5, '0');
        }
    }

    // ─────────────────────────────────────────────
    //  Reset
    // ─────────────────────────────────────────────
    resetPlayer() {
        if (!this.mesh) return;

        // FIX: was === (comparison) — must be = (assignment)
        this.mesh.position.y = this.initalPosition.y;
        this.jumpDirection = 0;
        this.jumpsUsed = 0;
        this.score = 0;
        this.updateScoreOnBoard();
    }

    // ─────────────────────────────────────────────
    //  Pause / Resume
    // ─────────────────────────────────────────────
    pauseAnimation() {
        if (this.mixer) {
            this.mixer.timeScale = 0;
        }
        if (this.runAction) {
            this.runAction.paused = true;
        }
    }

    resumeAnimation() {
        if (this.mixer) {
            this.mixer.timeScale = 1;
        }
        if (this.runAction) {
            this.runAction.paused = false;
        }
    }
}