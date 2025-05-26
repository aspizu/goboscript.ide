import * as goboscript from "goboscript"

goboscript.initialize()

onmessage = (event) => {
    postMessage(goboscript.build(event.data))
}
