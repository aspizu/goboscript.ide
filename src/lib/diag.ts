import {files} from "@/state"
import * as types from "./types"

/* 
    pub fn translate_position(&self, position: usize) -> (usize, &Include) {
        for include in &self.includes {
            debug_assert_eq!(include.unit_range.len(), include.source_range.len());
            if include.unit_range.contains(&position) {
                return (
                    include.source_range.start + (position - include.unit_range.start),
                    include,
                );
            }
        }
        panic!("invalid position {position} in {}", self.path.display());
    }
*/

export function translatePosition(
    self: types.TranslationUnit,
    position: number,
): [number, types.Include] {
    for (const include of self.includes) {
        if (include.unit_range.start <= position && position < include.unit_range.end) {
            return [
                include.source_range.start + (position - include.unit_range.start),
                include,
            ]
        }
    }
    throw new Error(`invalid position ${position} in ${self.path}`)
}

export function convertPosition(
    include: types.Include,
    position: number,
): [number, number] {
    const source = files.value.find(
        (f) => f.path === include.path.slice("project/".length),
    )?.text
    if (!source || typeof source !== "string") {
        return [0, 0]
    }
    let i = 0
    let line_no = 0
    for (const line of source.split("\n")) {
        if (i + line.length >= position) {
            return [line_no + 1, position - i + 1]
        }
        i += line.length + 1 // +1 for \n
        line_no++
    }
    throw new Error(`invalid position ${position} in ${include.path}`)
}

export function getDiagnosticMessage(diag: types.DiagnosticKind): string {
    if (typeof diag == "string") {
        switch (diag) {
            case "FollowedByUnreachableCode":
                return "Following code is unreachable."
            case "InvalidToken":
                return "Invalid token."
            case "NoCostumes":
                return "No costumes declared."
            case "NotStruct":
                return "Not a struct."
            case "UnrecognizedStandardLibraryHeader":
                return "Unrecognized standard library header."
            default:
                return "Unknown diagnostic."
        }
    } else {
        if ("UnrecognizedEof" in diag) {
            return `Unrecognized end of file, expected one of ${diag.UnrecognizedEof.join(", ")}.`
        }
        if ("UnrecognizedToken" in diag) {
            const [_token, expected] = diag.UnrecognizedToken
            return `Unrecognized token, expected one of ${expected.join(", ")}.`
        }
        if ("ExtraToken" in diag) {
            return "Extra token."
        }
        if ("IOError" in diag) {
            return `IO error: ${diag.IOError}`
        }
        if ("UnrecognizedReporter" in diag) {
            return `Unrecognized reporter: ${diag.UnrecognizedReporter}`
        }
        if ("UnrecognizedBlock" in diag) {
            return `Unrecognized block: ${diag.UnrecognizedBlock}`
        }
        if ("UnrecognizedVariable" in diag) {
            return `Unrecognized variable: ${diag.UnrecognizedVariable}`
        }
        if ("UnrecognizedList" in diag) {
            return `Unrecognized list: ${diag.UnrecognizedList}`
        }
        if ("UnrecognizedEnum" in diag) {
            return `Unrecognized enum: ${diag.UnrecognizedEnum}`
        }
        if ("UnrecognizedStruct" in diag) {
            return `Unrecognized struct: ${diag.UnrecognizedStruct}`
        }
        if ("UnrecognizedProcedure" in diag) {
            return `Unrecognized procedure: ${diag.UnrecognizedProcedure}`
        }
        if ("UnrecognizedFunction" in diag) {
            return `Unrecognized function: ${diag.UnrecognizedFunction}`
        }
        if ("UnrecognizedArgument" in diag) {
            return `Unrecognized argument: ${diag.UnrecognizedArgument}`
        }
        if ("UnrecognizedStructField" in diag) {
            return `Unrecognized struct field: ${diag.UnrecognizedStructField}`
        }
        if ("UnrecognizedEnumVariant" in diag) {
            return `Unrecognized enum variant: ${diag.UnrecognizedEnumVariant}`
        }
        if ("BlockArgsCountMismatch" in diag) {
            const {block, given} = diag.BlockArgsCountMismatch
            return `Block argument count mismatch for block '${block}'. Given: ${given}.`
        }
        if ("ReprArgsCountMismatch" in diag) {
            const {repr, given} = diag.ReprArgsCountMismatch
            return `Repr argument count mismatch for '${repr}'. Given: ${given}.`
        }
        if ("ProcArgsCountMismatch" in diag) {
            const {proc, given} = diag.ProcArgsCountMismatch
            return `Procedure '${proc}' called with incorrect number of arguments. Given: ${given}.`
        }
        if ("FuncArgsCountMismatch" in diag) {
            const {func, given} = diag.FuncArgsCountMismatch
            return `Function '${func}' called with incorrect number of arguments. Given: ${given}.`
        }
        if ("MacroArgsCountMismatch" in diag) {
            const {expected, given} = diag.MacroArgsCountMismatch
            return `Macro argument count mismatch. Expected: ${expected}, Given: ${given}.`
        }
        if ("CommandFailed" in diag) {
            const stderr = new TextDecoder().decode(
                new Uint8Array(diag.CommandFailed.stderr),
            )
            return `Command failed with error: ${stderr}`
        }
        if ("TypeMismatch" in diag) {
            const {expected, given} = diag.TypeMismatch
            return `Type mismatch. Expected: ${expected}, Given: ${given}.`
        }
        if ("StructDoesNotHaveField" in diag) {
            const {type_name, field_name} = diag.StructDoesNotHaveField
            return `Struct '${type_name}' does not have a field named '${field_name}'.`
        }
        if ("MissingField" in diag) {
            const {struct_name, field_name} = diag.MissingField
            return `Missing field '${field_name}' in struct '${struct_name}'.`
        }
        if ("UnrecognizedKey" in diag) {
            return `Unrecognized key: ${diag.UnrecognizedKey}`
        }
        if ("UnusedVariable" in diag) {
            return `Unused variable: ${diag.UnusedVariable}`
        }
        if ("UnusedList" in diag) {
            return `Unused list: ${diag.UnusedList}`
        }
        if ("UnusedEnum" in diag) {
            return `Unused enum: ${diag.UnusedEnum}`
        }
        if ("UnusedStruct" in diag) {
            return `Unused struct: ${diag.UnusedStruct}`
        }
        if ("UnusedProc" in diag) {
            return `Unused procedure: ${diag.UnusedProc}`
        }
        if ("UnusedFunc" in diag) {
            return `Unused function: ${diag.UnusedFunc}`
        }
        if ("UnusedArg" in diag) {
            return `Unused argument: ${diag.UnusedArg}`
        }
        if ("UnusedStructField" in diag) {
            return `Unused struct field: ${diag.UnusedStructField}`
        }
        if ("UnusedEnumVariant" in diag) {
            return `Unused enum variant: ${diag.UnusedEnumVariant}`
        }
    }
    return "Unknown diagnostic."
}
