import {localsignal} from "@/lib/localsignal"

export interface Message {
    severity: "error" | "warn" | "log"
    message: string
    path: string
    lineNumber: number
}

const console = await localsignal<Message[]>("console", [])

export function getMessages() {
    return console.value
}

export function addMessage(...message: Message[]) {
    console.value = [...console.value, ...message]
}

export function removeAllMessages() {
    console.value = []
}

export function setMessages(messages: Message[]) {
    console.value = messages
}
