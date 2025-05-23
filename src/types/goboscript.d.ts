export {}

declare module "goboscript" {
    interface Span {
        start: number
        end: number
    }

    type Sprite = object

    type FxHashMap<K, V> = Map<K, V>
}
