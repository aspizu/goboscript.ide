import {getSourceLocation} from "@/lib/goboutils"
import {Console, Project} from "@/state"

function addDebuggerMessage(
    severity: "log" | "warn" | "error",
    message: string,
    util: VM.BlockUtility
) {
    const artifact = Project.getArtifact()
    if (!artifact) return
    const blockID = util.thread.peekStack()
    const targetName = util.target.getName()
    const location = getSourceLocation(artifact, targetName, blockID)
    if (!location) return
    const [[lineNumber, _columnNumber], include] = location
    Console.addMessage({
        severity,
        message,
        path: include.path.slice("project/".length),
        lineNumber
    })
}

export function attachDebugger(vm: VM) {
    vm.runtime.addAddonBlock({
        procedureCode: "\u200B\u200Blog\u200B\u200B %s",
        arguments: ["content"],
        callback: ({content}, util) => {
            addDebuggerMessage("log", content.toString(), util)
        }
    })
    vm.runtime.addAddonBlock({
        procedureCode: "\u200B\u200Bwarn\u200B\u200B %s",
        arguments: ["content"],
        callback: ({content}, util) => {
            addDebuggerMessage("warn", content.toString(), util)
        }
    })
    vm.runtime.addAddonBlock({
        procedureCode: "\u200B\u200Berror\u200B\u200B %s",
        arguments: ["content"],
        callback: ({content}, util) => {
            addDebuggerMessage("error", content.toString(), util)
        }
    })
}
