import Emitter from "./Emitter"

export default class Sizes extends Emitter  {
    constructor() {
        super()

        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio =  Math.min(window.devicePixelRatio, 2)

        window.addEventListener('resize', () => {

            this.width = window.innerWidth
            this.height = window.innerHeight
            this.pixelRatio =  Math.min(window.devicePixelRatio, 2)

            this.event.emit('resize')
        })
    }
}