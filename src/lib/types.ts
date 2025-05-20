type Token = any
type SmolStr = string
type FxHashSet<T> = Set<T>
type FxHashMap<K, V> = Map<K, V>
type Span = {start: number; end: number}

export type Owner = "Local" | "StandardLibrary"

export interface TranslationUnit {
    path: string
    text: number[]
    defines: FxHashSet<string>
    includes: Include[]
    included: FxHashSet<string>
    current_include: number
}

/**
 * A section of a source file that is included in the translation unit.
 * This may be a section of the source file, or the entire source file.
 */
export interface Include {
    /**
     * The range that the source code of the include is in the translation unit.
     */
    unit_range: Span
    source_range: Span
    path: string
    owner: Owner
}

export interface SpriteDiagnostics {
    sprite_name: string
    translation_unit: TranslationUnit
    diagnostics: Diagnostic[]
}

export interface Diagnostics {
    stage_diagnostics: SpriteDiagnostics
    sprites_diagnostics: FxHashMap<SmolStr, SpriteDiagnostics>
}

export interface Diagnostic {
    kind: DiagnosticKind
    span: Span
}

export type DiagnosticKind =
    | "InvalidToken"
    | {UnrecognizedEof: string[]}
    | {UnrecognizedToken: [Token, string[]]}
    | {ExtraToken: Token}
    | {IOError: SmolStr}
    | {UnrecognizedReporter: SmolStr}
    | {UnrecognizedBlock: SmolStr}
    | {UnrecognizedVariable: SmolStr}
    | {UnrecognizedList: SmolStr}
    | {UnrecognizedEnum: SmolStr}
    | {UnrecognizedStruct: SmolStr}
    | {UnrecognizedProcedure: SmolStr}
    | {UnrecognizedFunction: SmolStr}
    | {UnrecognizedArgument: SmolStr}
    | {UnrecognizedStructField: SmolStr}
    | {UnrecognizedEnumVariant: SmolStr}
    | "UnrecognizedStandardLibraryHeader"
    | "NoCostumes"
    | {BlockArgsCountMismatch: {block: Block; given: number}}
    | {ReprArgsCountMismatch: {repr: Repr; given: number}}
    | {ProcArgsCountMismatch: {proc: SmolStr; given: number}}
    | {FuncArgsCountMismatch: {func: SmolStr; given: number}}
    | {MacroArgsCountMismatch: {expected: number; given: number}}
    | {CommandFailed: {stderr: number[]}}
    | {TypeMismatch: {expected: Type; given: Type}}
    | "NotStruct"
    | {StructDoesNotHaveField: {type_name: SmolStr; field_name: SmolStr}}
    | {MissingField: {struct_name: SmolStr; field_name: SmolStr}}
    | "FollowedByUnreachableCode"
    | {UnrecognizedKey: SmolStr}
    | {UnusedVariable: SmolStr}
    | {UnusedList: SmolStr}
    | {UnusedEnum: SmolStr}
    | {UnusedStruct: SmolStr}
    | {UnusedProc: SmolStr}
    | {UnusedFunc: SmolStr}
    | {UnusedArg: SmolStr}
    | {UnusedStructField: SmolStr}
    | {UnusedEnumVariant: SmolStr}
