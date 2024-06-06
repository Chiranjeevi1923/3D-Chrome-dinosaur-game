import * as THREE from 'three';
import View from "../View";
import { roughness } from 'three/examples/jsm/nodes/Nodes.js';
import { CONSTANT } from '../Utils/Consants';

export default class Floor {
    constructor() {
        this.view = new View()
        this.scene = this.view.scene
        this.resources = this.view.resources

         // Setup
         this.setGeometry()
         this.setTextures()
         this.setMaterial()
         this.setMesh()
    }

    setGeometry() {
        this.geometry = new THREE.PlaneGeometry(500, 500)
    }

    setTextures() {
        this.textures = {}
        this.textures.color = this.resources.items.sandColorTexture
        this.textures.color.colorSpace = THREE.SRGBColorSpace
        this.textures.color.repeat.set(3, 3)
        this.textures.color.wrapS = THREE.RepeatWrapping
        this.textures.color.wrapT = THREE.RepeatWrapping

        this.textures.normal = this.resources.items.sandNormalTexture
        this.textures.normal.repeat.set(3, 3)
        this.textures.normal.wrapS = THREE.RepeatWrapping
        this.textures.normal.wrapT = THREE.RepeatWrapping

        // Add roughness texture
        this.textures.roughness = this.resources.items.sandRoughnessTexture;
        this.textures.roughness.repeat.set(3, 3);
        this.textures.roughness.wrapS = THREE.RepeatWrapping;
        this.textures.roughness.wrapT = THREE.RepeatWrapping;

    }

    setMaterial() {
        this.material = new THREE.MeshStandardMaterial({
            color: CONSTANT.rendererClearColor,
            normalMap: this.textures.normal,
            roughnessMap: this.textures.roughness,
            roughness: 1.5,
            
        })
    }

    setMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.rotation.x = - Math.PI / 2
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh)
    }
}