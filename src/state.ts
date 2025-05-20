import {computed, signal} from "@preact/signals-react"

export interface File {
    path: string
    text: string | Blob
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

export const currentFile = computed(
    () => files.value.find((f) => f.path === currentFilePath.value)!,
)
