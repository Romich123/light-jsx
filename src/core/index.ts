import { createEffect } from "../signals"
import { JSX as JSXT } from "./jsxTypes"

export namespace LightJSX {
    const entityMap: Record<string, string> = {
        "&": "amp",
        "<": "lt",
        ">": "gt",
        '"': "quot",
        "'": "#39",
        "/": "#x2F",
    }

    const escapeHtml = (str: object[] | string) => String(str).replace(/[&<>"'\/\\]/g, (s) => `&${entityMap[s]};`)

    const emptyNodeSymbol = Symbol("empty node")
    const textNodeSymbol = Symbol("text node")

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

        el.style.display = "contents"

        el.append(...children)

        return el
    }

    // changes prev elements
    function replaceNode(prev: Node, cur: Node) {
        let parent = prev.parentNode

        if (!parent) {
            throw new Error("no parent")
        }

        if (prev instanceof Text && cur instanceof Text && isEmptyNode(prev) && isEmptyNode(cur)) {
            return prev
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
            elm.setAttribute(name, escapeHtml(val))
        } else if (val === false) {
            elm.removeAttribute(name)
        }
    }

    export function createNativeElement(tag: string, attrs?: { [key: string]: any }, ...children: any[]): JSX.Element {
        attrs = attrs || {}
        const stack: any[] = [...children]

        const elm = document.createElement(tag)

        for (let [name, val] of Object.entries(attrs)) {
            name = escapeHtml(name)

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

        const stack = children.flat(Infinity).map(anyToNode).flat(Infinity) as Node[]

        let el: any

        if (typeof component === "string") {
            el = createNativeElement(component, attrs, ...stack)
        } else {
            attrs.children = children
            el = component(attrs as any, stack)
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
