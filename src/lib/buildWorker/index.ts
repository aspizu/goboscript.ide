import type {Build, MemFS} from "goboscript"
import Worker from "./worker?worker"

const worker = new Worker({name: "buildWorker"})

export function build(fs: MemFS): Promise<Build> {
    return new Promise((resolve) => {
        worker.onmessage = (event) => {
            resolve(event.data)
        }
        worker.postMessage(fs)
    })
}
