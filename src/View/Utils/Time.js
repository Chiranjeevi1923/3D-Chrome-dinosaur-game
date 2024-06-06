import Emitter from "./Emitter";

export default class Time extends Emitter {
    constructor(){
        super()

        this.start = Date.now()
        this.current = this.start
        this.elapsed = 0
        this.delta = 16

        window.requestAnimationFrame(() => {
            this.tick()
        })
    }

    tick() {

        const currentTime = Date.now()
        this.delta = currentTime - this.current
        this.current = currentTime
        this.elapsed = this.current - this.start

        window.requestAnimationFrame(() => {
            this.tick()
            this.event.emit('tick', this.delta, this.elapsed)
        })

    }
}