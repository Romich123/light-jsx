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

    type EmptyNode = Text & { [emptyNodeSymbol]: true }

    export function isEmptyNode(node: Text): node is EmptyNode {
        return (node as any)[emptyNodeSymbol] ?? false
    }

    export function emptyNode(): Text {
        const el = document.createTextNode("") as EmptyNode

        el[emptyNodeSymbol] = true

        return el
    }

    // changes prev elements
    function replaceNodes(prev: Node[], cur: Node[]) {
        let html

        const startLength = prev.length

        for (const pre of prev) {
            if (pre.parentNode) {
                html = pre.parentNode
                break
            }
        }

        if (!html) {
            prev.length = 0
            for (const l of cur) {
                prev.push(l)
            }
            return
        }

        if (html.childNodes.length === startLength) {
            prev.length = 0
            for (const l of cur) {
                prev.push(l)
            }

            html.replaceChildren(...prev)
            return
        }

        let prevI = 0
        let curI = 0

        while (prevI < prev.length && curI < cur.length) {
            const prevO = prev[prevI]
            const curO = cur[curI]

            if (!prevO) {
                prevI++
                continue
            }

            if (!curO) {
                curI++
                continue
            }

            try {
                html.replaceChild(curO, prevO)
            } catch (e) {
                console.error("something went wrong, probably because of manual change of the DOM", e)
                html.appendChild(curO)
            }

            prevI++
            curI++
        }

        while (prevI < prev.length) {
            const prevO = prev[prevI]

            if (!prevO) {
                prevI++
                continue
            }

            try {
                html.removeChild(prevO)
            } catch (e) {
                console.error("something went wrong, probably because of manual change of the DOM", e)
            }

            prevI++
        }

        while (curI < cur.length) {
            const curO = cur[curI]

            if (!curO) {
                curI++
                continue
            }

            try {
                html.appendChild(curO)
            } catch (e) {
                console.error("something went wrong, probably because of manual change of the DOM", e)
            }

            curI++
        }

        prev.length = 0
        for (const l of cur) {
            prev.push(l)
        }
    }

    export function anyToNodes(child: any): Node[] {
        if (child === null || child === undefined) {
            return [emptyNode()]
        }

        if (child instanceof Node) {
            return [child]
        }

        if (Array.isArray(child)) {
            return child
                .flat(Infinity)
                .map((ch) => anyToNodes(ch))
                .flat(Infinity) as Node[]
        }

        if (typeof child === "string" || typeof child === "number" || typeof child === "bigint" || typeof child === "boolean") {
            child = child + ""

            return [document.createTextNode(child)]
        }

        if (typeof child === "function") {
            const comp = child as Function

            let prev: Node[] = []

            createEffect(() => {
                let cur = comp()

                if (cur === null || cur === undefined) {
                    cur = [null]
                }

                if (!Array.isArray(cur)) {
                    cur = [cur]
                }

                cur = cur.flat(Infinity).map(anyToNodes).flat(Infinity)

                replaceNodes(prev, cur)
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

        const stack = children.flat(Infinity).map(anyToNodes).flat(Infinity) as Node[]

        let el: any

        if (typeof component === "string") {
            el = createNativeElement(component, attrs, ...stack)
        } else {
            attrs.children = children
            el = component(attrs as any, children)
        }

        return el
    }

    export const Fragment: JSX.Input = (_, children) => children.flat(Infinity).map(anyToNodes).flat(Infinity)

    export function render(html: Element, inp: JSX.Element | (() => JSX.Element) | JSX.Child | (() => JSX.Child)) {
        const nodes = anyToNodes(inp).flat(Infinity)

        for (const node of nodes) {
            html.appendChild(node)
        }
    }

    export namespace JSX {
        export type Element = JSXT.Element
        export type Input<T extends { [k: string]: any } = {}, C = Child> = JSXT.Input<T, C>
        export type IntrinsicElements = JSXT.IntrinsicElements
        export type Child = JSXT.Child
    }
}
