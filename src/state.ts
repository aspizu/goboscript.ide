import {signal} from "@preact/signals-react"
import {$monaco, LANGUAGES} from "./features/app"

export interface File {
    path: string
    text: string | Blob
}

export function setFiles(newFiles: File[]) {
    files.value = newFiles
    for (const file of newFiles) {
        const model = $monaco.value?.editor.getModel(
            $monaco.value.Uri.parse(`file:///${file.path}`),
        )
        if (model) {
            $monaco.value?.editor.setModelLanguage(
                model,
                LANGUAGES[file.path.split(".").pop() ?? "txt"],
            )
            if (typeof file.text === "string") {
                model.setValue(file.text)
            }
        }
    }
}

export const files = signal<File[]>([
    {
        path: "stage.gs",
        text: 'costumes "blank.svg";\n',
    },
    {
        path: "main.gs",
        text: 'costumes "blank.svg";\n\nonflag {\n    say "Hello World!";\n}\n',
    },
    {
        path: "blank.svg",
        text: `<svg
    version="1.1"
    width="2"
    height="2"
    viewBox="-1 -1 2 2"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
>
</svg> <!--rotationCenter:0:0-->
`,
    },
])

export const currentFilePath = signal("main.gs")
