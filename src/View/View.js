import Camera from "./Camera"
import Renderer from "./Renderer"
import Sizes from "./Utils/Sizes"
import Time from "./Utils/Time"
import * as THREE from 'three'
import World from "./World/World"
import Resources from "./Utils/Resources"
import sources from "./sources"
import Debug from "./Utils/Debug"

let _instance = null
export default class View {
    constructor(canvas) {
        if (_instance) {
            return _instance
        }
        _instance = this


        // Instantiate all the utilities
        this.loadingManager = new THREE.LoadingManager();
        this.canvas = canvas
        this.debug = new Debug()
        this.resources = new Resources(sources)
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.world = new World()
        this.isGameLoaded = false;
        this.instance = this;

        this.loadPercentage = 0;
        this.isGameOver = false;
        this.isCameraAnimationComplete = false;


        // DOM elements
        this.progressBar = document.querySelector('.progress-bar .progress');
        this.percentageText = document.querySelector('.parcentage-text');
        this.loadingContainer = document.querySelector('.loading-container');
        

        // Window resize lisener
        this.sizes.event.on('resize', () => {
            this.resize()
        })

        // Time tick listener
        this.time.event.on('tick', (delta, elapsed) => {
            this.update(elapsed, delta)
        })

        this.initalizeLoadingManagerEvents();
    }

    initalizeLoadingManagerEvents() {
        this.loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
            this.loadPercentage = Math.round((itemsLoaded / itemsTotal) * 100);
            _instance.progressBar.style.width = this.loadPercentage + '%';
            _instance.percentageText.innerHTML = this.loadPercentage + '%';
        };

        this.loadingManager.onLoad = function () {
            _instance.loadTheGame();
        };

        this.camera.event.on('cameraAnimationComplete', () => {
            this.isCameraAnimationComplete = true;
        })
    }

    loadTheGame() {
        this.isGameLoaded = true;
        this.loadingContainer.classList.add('opacity-0');
        setTimeout(() => {
            this.loadingContainer.classList.add('d-none');
        }, 200)

        this.annimateCamera();
    }

    annimateCamera() {
        this.camera.animateCamera();
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()

    }

    update(elapsedTime, deltaTime) {
        this.camera.update()
        this.renderer.update()

        // If the game is over, stop updating the world objects
        if (this.isGameOver) {
            return;
        }


        this.world.updateBackground()
        this.world.updatePlayer()
        this.world.updateObstacles()
        this.world.updatePlane();

        if (this.isCameraAnimationComplete)
            this.world.updateScore();
    }
}