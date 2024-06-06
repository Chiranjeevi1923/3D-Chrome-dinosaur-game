import { CONSTANT } from "./Utils/Consants";
import View from "./View";
import * as THREE from 'three'

export default class Renderer {
    constructor() {

        this.view = new View()
        this.sizes = this.view.sizes
        this.cavans = this.view.canvas
        this.scene = this.view.scene
        this.camera = this.view.camera


        this.setInstance()
        this.resize()
    }

    setInstance() {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.cavans,
            antialias: true
        })
        this.instance.useLegacyLights = false
        this.instance.toneMapping = THREE.CineonToneMapping
        this.instance.toneMappingExposure = 1.75
        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio);
        this.instance.setClearColor(CONSTANT.skyColor, 1)

    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    update() {
        this.instance.render(this.scene, this.camera.instance)
    }


}