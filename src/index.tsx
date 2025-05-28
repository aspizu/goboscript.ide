// @ts-expect-error Types don't exist
import "@fontsource-variable/inter"
// @ts-expect-error Types don't exist
import "@fontsource/cascadia-code"

import "@/styles/index.css"

import {App} from "@/features/app"
import {createRoot} from "react-dom/client"

const root = document.getElementById("root") as HTMLDivElement
createRoot(root).render(<App />)
