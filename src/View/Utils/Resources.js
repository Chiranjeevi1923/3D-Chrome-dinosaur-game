import View from "../View";
import loaders from "../loaders";
import Emitter from "./Emitter";
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default class Resources extends Emitter {
    constructor(sources) {
        super()

        this.view = new View()
        this.resources = sources
        
        this.items = {}
        this.toLoad = this.resources.length
        this.loaded = 0

        this.setLoaders()
        this.loadResources()
    }

    setLoaders() {
        this.loaders = {}
        this.loaders.textureLoader = new THREE.TextureLoader()
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
        this.loaders.gltfLoader = new GLTFLoader()
        this.loader = new Map()
        // Load any loader here if needed and add the name in 'loaders.js array list'
        for(const loader of loaders) {
            let loaderType = null
            switch(loader) {
                case 'cubeTexture':
                    loaderType = this.loaders.cubeTextureLoader
                    break;
                case 'gltfModel':
                    loaderType = this.loaders.gltfLoader
                    break;
                case 'texture':
                    loaderType = this.loaders.textureLoader

            }

            this.loader.set(loader, loaderType)
        }
    }


    loadResources() {
        for(const resource of this.resources) {
            const loader = this.loader.get(resource.type)
            if(loader) {
                loader.load(
                    resource.path,
                    (file) => {
                        this.resourceLoaded(resource, file)
                    }
                )
            }
        }
    }

    resourceLoaded(resource, file) {
        this.loaded++
        this.items[resource.name] = file
        if(this.loaded ===  this.toLoad) {
           this.event.emit('ready')
        }
    }
}