type Context = {
    fn: () => void
    parent: Context | null
    name?: string
    dependant: any[]
}

let currentContext: Context | null = null

export type Getter<T> = () => T
export type Setter<T> = (t: T) => void

export function createSignal<T>(defaultVal: T) {
    let val = defaultVal
    const contexts: Map<Context, true> = new Map()

    const getter = () => {
        if (currentContext) contexts.set(currentContext, true)

        return val
    }

    return [
        getter,
        (v: T) => {
            val = v

            for (let context of contexts.keys()) {
                context.fn?.()
            }
        },
    ] as [Getter<T>, Setter<T>]
}

export function createEffect(fn: () => void, debugName?: string) {
    currentContext = { fn, parent: currentContext, name: debugName, dependant: [] }

    fn()

    currentContext = (currentContext as Context).parent
}

export function createComputed<T>(fn: () => T) {
    let [val, setVal] = createSignal<T>(undefined as any)

    createEffect(() => {
        setVal(fn())
    })

    return (() => val()) as Getter<T>
}
