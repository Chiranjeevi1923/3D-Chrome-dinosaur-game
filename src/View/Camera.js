import View from "./View";
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gsap } from 'gsap';
import Emitter from "./Utils/Emitter";

export default class Camera extends Emitter {
    constructor() {
        super();

        this.view = new View()
        this.sizes = this.view.sizes
        this.canvas = this.view.canvas
        this.scene = this.view.scene

        this.initialCamerePosition = new THREE.Vector3(200, 0.5, 1);
        this.lookAtPosition = new THREE.Vector3(0, 0, 0);
        this.finalCameraPostion = new THREE.Vector3(-11, 2.2, 8)

        this.setInstance();
        this.setControls();

    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 1000)
        this.instance.position.set(this.initialCamerePosition.x, this.initialCamerePosition.y, this.initialCamerePosition.z);
        this.instance.lookAt(new THREE.Vector3(this.lookAtPosition.x, this.lookAtPosition.y, this.lookAtPosition.z));

        // const axesHelper = new THREE.AxesHelper( 5 );
        // this.scene.add( axesHelper );
    }

    setControls() {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update() {
        this.controls.update()
    }

    animateCamera() {
        const that = this;
        const curve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(250, 50, 5),   // Start point
            new THREE.Vector3(200, 1, -10),   // Start point
            new THREE.Vector3(70, 0.7, 15), // Control point 1
            this.finalCameraPostion  // End point
        );


        gsap.to(this.instance.position, {
            duration: 4.5, // Total animation duration
            repeat: 0, // No repetition
            ease: 'power1.inOut', // Smooth easing
            onUpdate: function () {
                // Calculate the current point along the curve based on the animation's progress
                const t = this.progress(); // Normalized value between 0 and 1
                const point = curve.getPoint(t); // Get the point on the curve at position 't'

                // Set the camera's position to this point
                that.instance.position.copy(point);

                // Make the camera look at origin
                that.instance.lookAt(
                    new THREE.Vector3(that.lookAtPosition.x, that.lookAtPosition.y, that.lookAtPosition.z)
                );
            },
            onComplete: function () {
                that.event.emit('cameraAnimationComplete')
            }
        });
    }
}