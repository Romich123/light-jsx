import { createEffect } from "../signals"
import { JSX as JSXT } from "./jsxTypes"

let currentUnmountFn: (() => void) | null = null
let currentMountFn: (() => void) | null = null

export function onUnmount(fn: () => void) {
    currentUnmountFn = fn
}

export function onMount(fn: () => void) {
    currentMountFn = fn
}

export namespace LightJSX {
    const emptyNodeSymbol = Symbol("empty node")
    const textNodeSymbol = Symbol("text node")
    const fragmentNodeSymbol = Symbol("fragment node")

    type EmptyNode = Text & { [emptyNodeSymbol]: true }
    type SimpleTextNode = Text & { [textNodeSymbol]: true }

    export function isEmptyNode(node: Text): node is EmptyNode {
        return (node as any)[emptyNodeSymbol] ?? false
    }

    export function emptyNode(): EmptyNode {
        const el = document.createTextNode("") as EmptyNode

        el[emptyNodeSymbol] = true

        return el
    }

    export function isSimpleTextNode(node: Text): node is SimpleTextNode {
        return (node as any)[textNodeSymbol] ?? false
    }

    export function simpleTextNode(val: string): Text {
        const el = document.createTextNode(val) as SimpleTextNode

        el[textNodeSymbol] = true

        return el
    }

    export function forwardChildren(children: Node[]): Node {
        if (children.length === 0) {
            return emptyNode()
        }

        const el = document.createElement("div")

        // @ts-ignore
        el[fragmentNodeSymbol] = children

        el.style.display = "contents"

        el.append(...children)

        return el
    }

    function replaceNode(prev: Node, cur: Node, parent?: Node | null): [Node, Node | null] {
        parent ??= prev.parentNode

        if (prev instanceof Text && cur instanceof Text && isEmptyNode(prev) && isEmptyNode(cur)) {
            return [prev, parent]
        }

        // @ts-ignore
        if (!parent && prev[fragmentNodeSymbol]) {
            // @ts-ignore
            const prevChild = prev[fragmentNodeSymbol]

            parent = prevChild[0].parentNode
        }

        if (!parent) {
            console.error(prev, cur)
            // @ts-ignore
            console.error(prev[fragmentNodeSymbol], cur[fragmentNodeSymbol])
            throw new Error("no parent")
        }

        // @ts-ignore
        if (prev[fragmentNodeSymbol] && cur[fragmentNodeSymbol]) {
            // @ts-ignore
            cur[fragmentNodeSymbol] = []

            // @ts-ignore
            const prevChilds = prev[fragmentNodeSymbol] as Node[]
            const curChilds = Array.from(cur.childNodes)

            let prevIndex = 0
            let curIndex = 0

            while (prevIndex < prevChilds.length) {
                const prev = prevChilds[prevIndex]!
                const current = curChilds[curIndex]

                if (prev.isEqualNode(current ?? null)) {
                    // @ts-ignore
                    cur[fragmentNodeSymbol].push(prev)

                    curIndex++
                    prevIndex++
                    continue
                }

                parent.removeChild(prev)

                prevIndex++
            }

            while (curIndex < curChilds.length) {
                const current = curChilds[curIndex]!

                parent.appendChild(current)
                // @ts-ignore
                cur[fragmentNodeSymbol].push(current)

                curIndex++
            }

            return [cur, parent]
        }

        if (prev instanceof Text && isEmptyNode(prev)) {
            parent.removeChild(prev)
        }

        // @ts-ignore
        if (prev[fragmentNodeSymbol]) {
            // @ts-ignore
            prev[fragmentNodeSymbol].forEach((child) => {
                parent!.removeChild(child)
            })

            parent.appendChild(cur)

            return [cur, parent]
        }

        // @ts-ignore
        if (cur[fragmentNodeSymbol]) {
            // @ts-ignore
            cur[fragmentNodeSymbol] = []

            cur.childNodes.forEach((child) => {
                parent!.appendChild(child)
                // @ts-ignore
                cur[fragmentNodeSymbol].push(child)
            })

            return [cur, parent]
        }

        parent.replaceChild(cur, prev)

        return [cur, parent]
    }

    export function anyToNode(child: any): Node {
        if (child === null || child === undefined) {
            return emptyNode()
        }

        if (child instanceof Node) {
            return child
        }

        if (Array.isArray(child)) {
            return forwardChildren(transformChildren(child))
        }

        if (typeof child === "string" || typeof child === "number" || typeof child === "bigint" || typeof child === "boolean") {
            child = child + ""

            return simpleTextNode(child)
        }

        if (typeof child === "function") {
            const comp = child as Function

            let prev!: Node
            let parent: Node | null = null
            let first = true

            createEffect(() => {
                let cur: Node = anyToNode(comp())

                if (first) {
                    prev = cur
                    first = false
                    return
                }

                const result = replaceNode(prev, cur, parent)

                prev = result[0]
                parent = result[1]
            })

            return prev
        }

        throw new Error(`bad jsx child: ${child}`)
    }

    function setAttribute(elm: HTMLElement, name: string, val: any) {
        if (name.startsWith("on") && name.toLowerCase() in window) {
            elm.addEventListener(name.toLowerCase().substring(2), val)
        } else if (name === "ref") {
            val(elm)
        } else if (typeof val === "function") {
            createEffect(() => {
                setAttribute(elm, name, val())
            })
        } else if (name === "style") {
            Object.assign(elm.style, val)
        } else if (val === true) {
            elm.setAttribute(name, name)
        } else if (val !== false && val != null) {
            elm.setAttribute(name, val)
        } else if (val === false) {
            elm.removeAttribute(name)
        }
    }

    function transformChildren(children: any[]) {
        const stack = children.flat(Infinity).map(anyToNode).flat(Infinity) as Node[]

        let index = 0
        while (index < stack.length) {
            const child = stack[index]!

            // @ts-ignore
            if (child[fragmentNodeSymbol] && child.childNodes.length !== 0) {
                stack.splice(Number(index), 1, ...child.childNodes)
                continue
            }

            index++
        }

        return stack
    }

    export function createNativeElement(tag: string, attrs?: { [key: string]: any }, ...children: any[]): JSX.Element {
        attrs = attrs || {}
        const stack: any[] = [...children]

        let elm

        if (tag === "svg" && attrs) {
            elm = document.createElementNS(attrs.xmlns, tag)
        } else {
            elm = document.createElement(tag)
        }

        for (let [name, val] of Object.entries(attrs)) {
            name = name

            setAttribute(elm, name, val)
        }

        while (stack.length) {
            const child = stack.shift()

            if (!Array.isArray(child)) {
                elm.appendChild((child as HTMLElement).nodeType == null ? document.createTextNode(child.toString()) : child)
            } else {
                stack.push(...child)
            }
        }

        return elm
    }

    export function DOMcreateElement(component: JSX.Input, attrs?: { [key: string]: any } | null, ...children: any[]): JSX.Element {
        attrs = attrs || {}

        const stack = transformChildren(children)

        let el: any

        if (typeof component === "string") {
            el = createNativeElement(component, attrs, ...stack)
        } else {
            attrs.children = stack

            let prev!: Node
            let parent!: Node | null
            let prevUnmountFunc: typeof currentUnmountFn = null
            let first = true

            createEffect(() => {
                currentMountFn = null
                currentUnmountFn = null
                let cur: Node = anyToNode(component(attrs as any, stack))
                if (currentMountFn) {
                    ;(currentMountFn as () => void)()
                }

                if (first) {
                    prev = cur
                    first = false
                    return
                }

                const result = replaceNode(prev, cur, parent)

                prev = result[0]
                parent = result[1]

                prevUnmountFunc?.()
                prevUnmountFunc = currentUnmountFn
            })

            el = prev
        }

        return el
    }

    export const Fragment: JSX.Input = (_, children) => {
        return children.flat(Infinity).map(anyToNode).flat(Infinity)
    }

    export function render(html: Element, inp: JSX.Element | (() => JSX.Element) | JSX.Child | (() => JSX.Child)) {
        const node = anyToNode(inp)

        html.appendChild(node)
    }

    export namespace JSX {
        export type Element = JSXT.Element
        export type Input<T extends { [k: string]: any } = {}, C = Child> = JSXT.Input<T, C>
        export type IntrinsicElements = JSXT.IntrinsicElements
        export type Child = JSXT.Child
    }
}
