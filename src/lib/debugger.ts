import {convertPosition, translatePosition} from "@/lib/diag"
import {build, Console} from "@/lib/state"

function addDebuggerMessage(
    severity: "log" | "warn" | "error",
    content: string,
    util: VM.BlockUtility,
) {
    const blockID = util.thread.peekStack()
    const $build = build.value
    if (!$build) return
    const {artifact} = $build
    const targetName = util.target.getName()
    const sprite =
        targetName === "Stage" ?
            artifact.project.stage
        :   artifact.project.sprites.get(targetName)
    if (!sprite) return
    const diagnostics =
        targetName === "Stage" ?
            artifact.stage_diagnostics
        :   artifact.sprites_diagnostics.get(targetName)
    if (!diagnostics) return
    const {translation_unit} = diagnostics
    const span = diagnostics.debug_info.blocks.get(`"${blockID}"`)
    if (!span) return
    const [start, incStart] = translatePosition(translation_unit, span.start)
    const [startLineNumber] = convertPosition(incStart, start)
    Console.addMessage(
        severity,
        content,
        incStart.path.slice("project/".length),
        startLineNumber,
    )
}

export function init(vm: VM) {
    vm.runtime.addAddonBlock({
        procedureCode: "\u200B\u200Blog\u200B\u200B %s",
        arguments: ["content"],
        callback: ({content}, util) => {
            addDebuggerMessage("log", content.toString(), util)
        },
    })
    vm.runtime.addAddonBlock({
        procedureCode: "\u200B\u200Bwarn\u200B\u200B %s",
        arguments: ["content"],
        callback: ({content}, util) => {
            addDebuggerMessage("warn", content.toString(), util)
        },
    })
    vm.runtime.addAddonBlock({
        procedureCode: "\u200B\u200Berror\u200B\u200B %s",
        arguments: ["content"],
        callback: ({content}, util) => {
            addDebuggerMessage("error", content.toString(), util)
        },
    })
}
