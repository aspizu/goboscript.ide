import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export async function openFilePicker(
    options: {
        multiple?: boolean
        accept?: string
        capture?: "user" | "environment"
    } = {},
): Promise<File[] | null> {
    return new Promise((resolve) => {
        const input = document.createElement("input")
        input.type = "file"
        input.multiple = options.multiple ?? false
        if (options.accept) input.accept = options.accept
        if (options.capture) input.capture = options.capture

        input.onchange = () => {
            resolve(input.files?.length ? Array.from(input.files) : null)
            document.body.removeChild(input)
        }

        window.addEventListener(
            "focus",
            () =>
                setTimeout(() => {
                    if (!input.files?.length) {
                        resolve(null)
                        document.body.removeChild(input)
                    }
                }, 300),
            {once: true},
        )

        input.style.display = "none"
        document.body.appendChild(input)
        input.click()
    })
}
