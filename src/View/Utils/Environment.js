import View from "../View";
import * as THREE from 'three'

import GUI from "lil-gui";
import { CONSTANT } from "./Consants";

export default class Environment {
    constructor() {
        this.view = new View()

        this.scene = this.view.scene
        this.debug = this.view.debug
        this.resources = this.view.resources
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Environment')
            // this.directionalLightDebugFolder = this.debugFolder.addFolder('Directional Light')
        }

        this.setEnvironmentMap();
        this.setDirectionalLight()
        this.setHemisphereLight()
        this.setAmbientLight()
    }

    setEnvironmentMap() {
        this.environmentMap = {}
        this.environmentMap.intensity = 1

        const color = CONSTANT.fogColor; // White fog color
        const near = 10; // Start of the fog
        const far = 400; // End of the fog
        const fog = new THREE.Fog(color, near, far);

        this.scene.environment = this.environmentMap.texture
        this.scene.fog = fog;

        this.environmentMap.updateMaterials = () => {
            this.scene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    child.material.envMap = this.environmentMap.texture
                    child.material.envMapIntensity = this.environmentMap.intensity
                    child.material.needsUpdate = true
                }
            })
        }
        this.environmentMap.updateMaterials()
        if (this.debug.active) {
            this.debugFolder
                .add(this.environmentMap, 'intensity', 0, 4, 0.001).onChange(this.environmentMap.updateMaterials)
            this.debugFolder
                .add(this.directionalLight.position, 'x')
                .name('sunLightX')
                .min(- 50)
                .max(50)
                .step(0.001)

            this.debugFolder
                .add(this.directionalLight.position, 'y')
                .name('sunLightY')
                .min(- 10)
                .max(20)
                .step(0.001)

            this.debugFolder
                .add(this.directionalLight.position, 'z')
                .name('sunLightZ')
                .min(- 10)
                .max(10)
                .step(0.001)
        }
    }

    setAmbientLight() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.05)
        this.scene.add(this.ambientLight)
    }

    setPointLight() {
        this.pointLight = new THREE.PointLight(0xffffff, 100, 1000)
        this.pointLight.castShadow = true;
        this.pointLight.shadow.camera.near = 0.1
        this.pointLight.shadow.camera.far = 1000
        this.pointLight.shadow.mapSize.set(512, 512)
        this.pointLight.position.set(0, 20, 0)
        this.scene.add(this.pointLight)

        // add helper
        this.pointLightHelper = new THREE.PointLightHelper(this.pointLight, 1);
        this.scene.add(this.pointLightHelper)
    }

    setDirectionalLight() {
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        this.directionalLight.position.set(60, 100, 10);
        this.directionalLight.target.position.set(40, 0, 0);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.bias = -0.001;
        this.directionalLight.shadow.mapSize.width = 4096;
        this.directionalLight.shadow.mapSize.height = 4096;
        this.directionalLight.shadow.camera.far = 500.0;
        this.directionalLight.shadow.camera.near = 1.0;
        this.directionalLight.shadow.camera.left = 100;
        this.directionalLight.shadow.camera.right = -100;
        this.directionalLight.shadow.camera.top = 100;
        this.directionalLight.shadow.camera.bottom = -100;
        this.scene.add(this.directionalLight)

        this.directionalLightHelper = new THREE.DirectionalLightHelper(this.directionalLight, 10);
        // this.scene.add(this.directionalLightHelper)
    }

    setHemisphereLight() {
        this.hemisphereLight = new THREE.HemisphereLight(CONSTANT.hemiSphereSkyColor, CONSTANT.hemiSphereGroundColor, 0.4)
        this.hemisphereLight.color.setHSL(0, 0, 0.8);
        this.hemisphereLight.position.set(0, 20, 0);
        this.scene.add(this.hemisphereLight)


        // this.hemisphereLightHelper = new THREE.HemisphereLightHelper(this.hemisphereLight, 1);
        // this.scene.add(this.hemisphereLightHelper)
    }
}