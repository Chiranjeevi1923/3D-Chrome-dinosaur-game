import EventEmitter from "events"

export default class Emitter {
    constructor() {
        this.event = new EventEmitter()
    }
}