import {fs} from "@/lib/state"
import * as types from "goboscript"

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
    let source = fs.value[include.path.slice("project/".length)]
    if (!source || typeof source !== "string") {
        return [0, 0]
    }
    source += "\n\n"
    let i = 0
    let line_no = 0
    for (const line of source.split("\n")) {
        if (i + line.length >= position) {
            return [line_no + 1, position - i + 1]
        }
        i += line.length + 1 // +1 for \n
        line_no++
    }
    return [0, 0]
}
