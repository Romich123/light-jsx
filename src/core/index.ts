import { createEffect } from "../signals"
import { JSX as JSXT } from "./jsxTypes"

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
        const el = document.createElement("div")

        // @ts-ignore
        el[fragmentNodeSymbol] = true

        el.style.display = "contents"

        el.append(...children)

        return el
    }

    function replaceNode(prev: Node, cur: Node) {
        let parent = prev.parentNode

        if (prev instanceof Text && cur instanceof Text && isEmptyNode(prev) && isEmptyNode(cur)) {
            return prev
        }

        if (!parent) {
            throw new Error("no parent")
        }

        parent.replaceChild(cur, prev)

        return cur
    }

    export function anyToNode(child: any): Node {
        if (child === null || child === undefined) {
            return emptyNode()
        }

        if (child instanceof Node) {
            return child
        }

        if (Array.isArray(child)) {
            return forwardChildren(
                child
                    .flat(Infinity)
                    .map((ch) => anyToNode(ch))
                    .flat(Infinity) as Node[]
            )
        }

        if (typeof child === "string" || typeof child === "number" || typeof child === "bigint" || typeof child === "boolean") {
            child = child + ""

            return simpleTextNode(child)
        }

        if (typeof child === "function") {
            const comp = child as Function

            let prev!: Node
            let first = true

            createEffect(() => {
                let cur: Node = anyToNode(comp())

                if (first) {
                    prev = cur
                    first = false
                    return
                }

                prev = replaceNode(prev, cur)
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

    function transformChildren(children: any[]): Node[] {
        const stack = children.flat(Infinity).map(anyToNode).flat(Infinity) as Node[]

        let index = 0
        while (index < stack.length) {
            const child = stack[index]

            if (!child) {
                continue
            }

            // @ts-ignore
            if (child[fragmentNodeSymbol]) {
                stack.splice(Number(index), 1, ...child.childNodes)
                index--
            }
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
            let first = true

            createEffect(() => {
                let cur: Node = anyToNode(component(attrs as any, stack))

                if (first) {
                    prev = cur
                    first = false
                    return
                }

                prev = replaceNode(prev, cur)
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
