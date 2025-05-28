import type {useMonaco} from "@monaco-editor/react"

export function register(monaco: NonNullable<ReturnType<typeof useMonaco>>) {
    monaco.languages.register({id: "goboscript", extensions: ["gs"]})
    monaco.languages.setMonarchTokensProvider("goboscript", {
        defaultToken: "",
        tokenPostfix: ".goboscript",

        keywords: [
            "costumes",
            "sounds",
            "global",
            "var",
            "list",
            "nowarp",
            "onflag",
            "onkey",
            "onbackdrop",
            "onloudness",
            "ontimer",
            "on",
            "onclone",
            "if",
            "else",
            "elif",
            "until",
            "forever",
            "repeat",
            "delete",
            "at",
            "add",
            "to",
            "insert",
            "true",
            "false",
            "as",
            "struct",
            "enum",
            "return",
            "error",
            "warn",
            "breakpoint",
            "local",
            "not",
            "and",
            "or",
            "in",
            "length",
            "round",
            "abs",
            "floor",
            "ceil",
            "sqrt",
            "sin",
            "cos",
            "tan",
            "asin",
            "acos",
            "atan",
            "ln",
            "log",
            "antiln",
            "antilog"
        ],

        typeKeywords: [
            "x_position",
            "y_position",
            "direction",
            "size",
            "costume_number",
            "costume_name",
            "backdrop_number",
            "backdrop_name",
            "volume",
            "distance_to_mouse_pointer",
            "distance_to",
            "touching_mouse_pointer",
            "touching_edge",
            "touching",
            "key_pressed",
            "mouse_down",
            "mouse_x",
            "mouse_y",
            "loudness",
            "timer",
            "current_year",
            "current_month",
            "current_date",
            "current_day_of_week",
            "current_hour",
            "current_minute",
            "current_second",
            "days_since_2000",
            "username",
            "touching_color",
            "color_is_touching_color",
            "answer",
            "random",
            "contains"
        ],

        operators: ["+", "-", "*", "/", "%", "<", ">", "=", "&", "!"],

        // The main tokenizer for our languages
        tokenizer: {
            root: [
                [/#.*$/, "comment"],
                [/\/\*/, "comment", "@commentBlock"],
                [/```/, "comment", "@commentTriple"],

                [
                    /%(include|define|undef|if|else|endif|if\snot\s)/,
                    "keyword.directive"
                ],

                [/"/, {token: "string.quote", bracket: "@open", next: "@string"}],

                [
                    /\b(proc|func)\b\s+([a-zA-Z_][_a-zA-Z0-9]*)/,
                    ["keyword", "entity.name.function"]
                ],
                [/[a-zA-Z_][_a-zA-Z0-9]*!/, "variable.parameter"],
                [/\$[_a-zA-Z0-9]+/, "variable.parameter"],

                [
                    /\b([0-9][_0-9]*|0x[_0-9a-fA-F]+|0b[_0-1]+|0o[_0-7]+|([0-9][0-9]*)?\.[0-9][_0-9]*)\b/,
                    "number"
                ],

                [/\.[a-zA-Z_0-9][_a-zA-Z_0-9]*/, "entity.name.function"],
                [/[;,]/, "delimiter"],
                [/[+\-*/%<>=&!]/, "operator"],

                [
                    /\b\w+\b/,
                    {
                        cases: {
                            "@keywords": "keyword",
                            "@typeKeywords": "type",
                            "@default": "identifier"
                        }
                    }
                ]
            ],

            commentBlock: [
                [/[^/*]+/, "comment"],
                [/\*\//, "comment", "@pop"],
                [/[/*]/, "comment"]
            ],

            commentTriple: [
                [/```/, "comment", "@pop"],
                [/[^`]+/, "comment"]
            ],

            string: [
                [/[^\\"]+/, "string"],
                [/\\["\\bfnrt]/, "string.escape"],
                [/\\u[a-fA-F0-9]{4}/, "string.escape"],
                [/"/, {token: "string.quote", bracket: "@close", next: "@pop"}]
            ]
        }
    })
}
