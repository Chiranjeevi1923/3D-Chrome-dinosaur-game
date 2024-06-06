import Environment from "../Utils/Environment";
import View from "../View";
import Floor from "./Floor";
import { Player } from './Player';
import { background } from './background';
import { obstacles } from './obstacles';
import { plane } from "./Airplane";

export default class World {
    constructor() {
        this.view = new View();
        this.time = this.view.time;
        this.scene = this.view.scene;
        this.resources = this.view.resources;
        this.loadingManager = this.view.loadingManager;

        this.gameOverContainer = document.querySelector('.game-over-container');
        this.restartGameButton = document.querySelector('#restart-game');

        this.resources.event.on('ready', () => {
            this.addFloor();
            this.addEnvironment();
            this.addBackground();
            this.addPlane();
            this.addPlayer();
            this.addCactusObstacles();
        })
        
        this.initializeRestartGameButtonEvent();
    }

    addFloor() {
        this.floor = new Floor();
    }

    addEnvironment() {
        this.environment = new Environment();
    }
    
    addBackground() {
        this.background = new background.Background();
    }

    addPlane() {
        this.plane = new plane.Plane(this.view);
    }

    addPlayer() {
        this.player = new Player(this.view);
        this.player.event.on('gameOver', () => {
            this.gameOverContainer.classList.remove('d-none');
        });
    }

    addCactusObstacles() {
        this.obstacles = new obstacles.Obstacle(this.view);
    }

    
    updateBackground() {
        this.background?.updateBackground();
    }

    updatePlane() {
        this.plane?.updatePosition();
    }

    updatePlayer() {
        this.player?.updatePlayer(this.time.elapsed);
    }

    updateObstacles() {
        this.obstacles?.updateObstacles();
    }

    updateScore() {
        this.player?.updateScore();
    }

    initializeRestartGameButtonEvent() {
        this.restartGameButton?.addEventListener('click', () => {
            this.obstacles.addResetObstacles(true);
            setTimeout(() => {
                this.player.score = 0;
                this.player.updateScoreOnBoard();
                this.player.resetPlayer();
                this.view.annimateCamera();
                this.view.isGameOver = false;
                this.view.isGameLoaded = true;
                this.view.isCameraAnimationComplete = false;
                this.gameOverContainer.classList.add('d-none');
            }, 200);
        })
    }

}