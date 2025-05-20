import {App} from "@/features/app"
import {StrictMode} from "react"
import {createRoot} from "react-dom/client"
import "./styles/main.css"

// @ts-expect-error i dont fucking know okay?
import "@fontsource-variable/inter"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
