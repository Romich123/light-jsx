import { createEffect } from "../signals"

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

    export function emptyNode(): Node {
        const el = document.createTextNode("")

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

    export function DOMcreateElement(component: JSX.Input, attrs?: { [key: string]: any }, ...children: any[]): JSX.Element {
        attrs = attrs || {}

        const stack = children.flat(Infinity).map(anyToNodes).flat(Infinity) as Node[]

        let el: any

        if (typeof component === "string") {
            el = createNativeElement(component, attrs, ...stack)
        } else {
            attrs.children = children
            el = () => component(attrs as any, children)
        }

        return el
    }

    export const Fragment: JSX.Input = (props) => props.children.flat(Infinity).map(anyToNodes).flat(Infinity) as JSX.Element

    export function render(html: Element, inp: JSX.Element | (() => JSX.Element)) {
        const nodes = anyToNodes(inp).flat(Infinity)

        for (const node of nodes) {
            html.appendChild(node)
        }
    }

    export namespace JSX {
        export type Element = Node | Node[]
        export type Attribute = string | number | bigint | boolean | null | undefined | (() => Attribute)
        export type Input<
            T extends {
                [k: string]: any
            } = {}
        > =
            | ((
                  props: T & {
                      children: Node[]
                  },
                  children: Node[]
              ) => Rendered | Rendered[])
            | string
        export type Rendered = Node | Node[]
        export type Convinience = string | bigint | number | null

        export type Child = Rendered | Convinience | (() => Convinience) | (() => Rendered)

        export type AttributesGlobal = {
            "accesskey"?: Attribute
            "autocapitalize"?: Attribute
            "class"?: Attribute
            "contenteditable"?: Attribute
            "contextmenu"?: Attribute
            "data-*"?: Attribute
            "dir"?: Attribute
            "draggable"?: Attribute
            "hidden"?: Attribute
            "id"?: Attribute
            "itemprop"?: Attribute
            "lang"?: Attribute
            "role"?: Attribute
            "slot"?: Attribute
            "spellcheck"?: Attribute
            "style"?: { [k: string]: string }
            "tabindex"?: Attribute
            "title"?: Attribute
            "translate"?: Attribute
        } & Partial<{
            onfullscreenchange: (this: Element, ev: Event) => any
            /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenerror_event) */
            onfullscreenerror: (this: Element, ev: Event) => any
        }> &
            Partial<GlobalEventHandlers>

        export interface IntrinsicElements {
            a: {
                "download"?: Attribute
                "href"?: Attribute
                "hreflang"?: Attribute
                "media"?: Attribute
                "ping"?: Attribute
                "referrerpolicy"?: Attribute
                "rel"?: Attribute
                "shape"?: Attribute
                "target"?: Attribute
            } & AttributesGlobal
            abbr: {} & AttributesGlobal
            acronym: {} & AttributesGlobal
            address: {} & AttributesGlobal
            applet: {} & AttributesGlobal
            area: {
                "alt"?: Attribute
                "coords"?: Attribute
                "download"?: Attribute
                "href"?: Attribute
                "media"?: Attribute
                "ping"?: Attribute
                "referrerpolicy"?: Attribute
                "rel"?: Attribute
                "shape"?: Attribute
                "target"?: Attribute
            } & AttributesGlobal
            article: {} & AttributesGlobal
            aside: {} & AttributesGlobal
            audio: {
                "autoplay"?: Attribute
                "buffered"?: Attribute
                "controls"?: Attribute
                "crossorigin"?: Attribute
                "loop"?: Attribute
                "muted"?: Attribute
                "preload"?: Attribute
                "src"?: Attribute
            } & AttributesGlobal
            b: {} & AttributesGlobal
            base: {
                "href"?: Attribute
                "target"?: Attribute
            } & AttributesGlobal
            basefont: {} & AttributesGlobal
            bdi: {} & AttributesGlobal
            bdo: {} & AttributesGlobal
            big: {} & AttributesGlobal
            blockquote: {
                "cite"?: Attribute
            } & AttributesGlobal
            body: {
                "background"?: Attribute
                "bgcolor"?: Attribute
            } & AttributesGlobal
            br: {} & AttributesGlobal
            button: {
                "disabled"?: Attribute
                "form"?: Attribute
                "formaction"?: Attribute
                "formenctype"?: Attribute
                "formmethod"?: Attribute
                "formnovalidate"?: Attribute
                "formtarget"?: Attribute
                "name"?: Attribute
                "type"?: Attribute
                "value"?: Attribute
            } & AttributesGlobal
            canvas: {
                "height"?: Attribute
                "width"?: Attribute
            } & AttributesGlobal
            caption: {
                "align"?: Attribute
            } & AttributesGlobal
            center: {} & AttributesGlobal
            cite: {} & AttributesGlobal
            code: {} & AttributesGlobal
            col: {
                "align"?: Attribute
                "bgcolor"?: Attribute
                "span"?: Attribute
            } & AttributesGlobal
            colgroup: {
                "align"?: Attribute
                "bgcolor"?: Attribute
                "span"?: Attribute
            } & AttributesGlobal
            data: {
                "value"?: Attribute
            } & AttributesGlobal
            datalist: {} & AttributesGlobal
            dd: {} & AttributesGlobal
            del: {
                "cite"?: Attribute
                "datetime"?: Attribute
            } & AttributesGlobal
            details: {
                "open"?: Attribute
            } & AttributesGlobal
            dfn: {} & AttributesGlobal
            dialog: {
                "open"?: Attribute
            } & AttributesGlobal
            dir: {} & AttributesGlobal
            div: {} & AttributesGlobal
            dl: {} & AttributesGlobal
            dt: {} & AttributesGlobal
            em: {} & AttributesGlobal
            embed: {
                "height"?: Attribute
                "src"?: Attribute
                "type"?: Attribute
                "width"?: Attribute
            } & AttributesGlobal
            fieldset: {
                "disabled"?: Attribute
                "form"?: Attribute
                "name"?: Attribute
            } & AttributesGlobal
            figcaption: {} & AttributesGlobal
            figure: {} & AttributesGlobal
            font: {
                "color"?: Attribute
            } & AttributesGlobal
            footer: {} & AttributesGlobal
            form: {
                "accept"?: Attribute
                "accept-charset"?: Attribute
                "action"?: Attribute
                "autocomplete"?: Attribute
                "enctype"?: Attribute
                "method"?: Attribute
                "name"?: Attribute
                "novalidate"?: Attribute
                "target"?: Attribute
            } & AttributesGlobal
            frame: {} & AttributesGlobal
            frameset: {} & AttributesGlobal
            h1: {} & AttributesGlobal
            h2: {} & AttributesGlobal
            h3: {} & AttributesGlobal
            h4: {} & AttributesGlobal
            h5: {} & AttributesGlobal
            h6: {} & AttributesGlobal
            head: {} & AttributesGlobal
            header: {} & AttributesGlobal
            hr: {
                "align"?: Attribute
                "color"?: Attribute
            } & AttributesGlobal
            html: {
                "manifest"?: Attribute
            } & AttributesGlobal
            i: {} & AttributesGlobal
            iframe: {
                "align"?: Attribute
                "allow"?: Attribute
                "csp"?: Attribute
                "height"?: Attribute
                "loading"?: Attribute
                "name"?: Attribute
                "referrerpolicy"?: Attribute
                "sandbox"?: Attribute
                "src"?: Attribute
                "srcdoc"?: Attribute
                "width"?: Attribute
            } & AttributesGlobal
            img: {
                "align"?: Attribute
                "alt"?: Attribute
                "border"?: Attribute
                "crossorigin"?: Attribute
                "decoding"?: Attribute
                "height"?: Attribute
                "intrinsicsize"?: Attribute
                "ismap"?: Attribute
                "loading"?: Attribute
                "referrerpolicy"?: Attribute
                "sizes"?: Attribute
                "src"?: Attribute
                "srcset"?: Attribute
                "usemap"?: Attribute
                "width"?: Attribute
            } & AttributesGlobal
            input: {
                "accept"?: Attribute
                "alt"?: Attribute
                "autocomplete"?: Attribute
                "capture"?: Attribute
                "checked"?: Attribute
                "dirname"?: Attribute
                "disabled"?: Attribute
                "form"?: Attribute
                "formaction"?: Attribute
                "formenctype"?: Attribute
                "formmethod"?: Attribute
                "formnovalidate"?: Attribute
                "formtarget"?: Attribute
                "height"?: Attribute
                "list"?: Attribute
                "max"?: Attribute
                "maxlength"?: Attribute
                "minlength"?: Attribute
                "min"?: Attribute
                "multiple"?: Attribute
                "name"?: Attribute
                "pattern"?: Attribute
                "placeholder"?: Attribute
                "readonly"?: Attribute
                "required"?: Attribute
                "size"?: Attribute
                "src"?: Attribute
                "step"?: Attribute
                "type"?: Attribute
                "usemap"?: Attribute
                "value"?: Attribute
                "width"?: Attribute
            } & AttributesGlobal
            ins: {
                "cite"?: Attribute
                "datetime"?: Attribute
            } & AttributesGlobal
            kbd: {} & AttributesGlobal
            label: {
                "for"?: Attribute
                "form"?: Attribute
            } & AttributesGlobal
            legend: {} & AttributesGlobal
            li: {
                "value"?: Attribute
            } & AttributesGlobal
            link: {
                "crossorigin"?: Attribute
                "href"?: Attribute
                "hreflang"?: Attribute
                "integrity"?: Attribute
                "media"?: Attribute
                "referrerpolicy"?: Attribute
                "rel"?: Attribute
                "sizes"?: Attribute
                "type"?: Attribute
            } & AttributesGlobal
            main: {} & AttributesGlobal
            map: {
                "name"?: Attribute
            } & AttributesGlobal
            mark: {} & AttributesGlobal
            meta: {
                "charset"?: Attribute
                "content"?: Attribute
                "http-equiv"?: Attribute
                "name"?: Attribute
            } & AttributesGlobal
            meter: {
                "form"?: Attribute
                "high"?: Attribute
                "low"?: Attribute
                "max"?: Attribute
                "min"?: Attribute
                "optimum"?: Attribute
                "value"?: Attribute
            } & AttributesGlobal
            nav: {} & AttributesGlobal
            noframes: {} & AttributesGlobal
            noscript: {} & AttributesGlobal
            object: {
                "border"?: Attribute
                "data"?: Attribute
                "form"?: Attribute
                "height"?: Attribute
                "name"?: Attribute
                "type"?: Attribute
                "usemap"?: Attribute
                "width"?: Attribute
            } & AttributesGlobal
            ol: {
                "reversed"?: Attribute
                "start"?: Attribute
                "type"?: Attribute
            } & AttributesGlobal
            optgroup: {
                "disabled"?: Attribute
                "label"?: Attribute
            } & AttributesGlobal
            option: {
                "disabled"?: Attribute
                "label"?: Attribute
                "selected"?: Attribute
                "value"?: Attribute
            } & AttributesGlobal
            output: {
                "for"?: Attribute
                "form"?: Attribute
                "name"?: Attribute
            } & AttributesGlobal
            p: {} & AttributesGlobal
            param: {
                "name"?: Attribute
                "value"?: Attribute
            } & AttributesGlobal
            picture: {} & AttributesGlobal
            pre: {} & AttributesGlobal
            progress: {
                "form"?: Attribute
                "max"?: Attribute
                "value"?: Attribute
            } & AttributesGlobal
            q: {
                "cite"?: Attribute
            } & AttributesGlobal
            rp: {} & AttributesGlobal
            rt: {} & AttributesGlobal
            ruby: {} & AttributesGlobal
            s: {} & AttributesGlobal
            samp: {} & AttributesGlobal
            script: {
                "async"?: Attribute
                "crossorigin"?: Attribute
                "defer"?: Attribute
                "integrity"?: Attribute
                "language"?: Attribute
                "referrerpolicy"?: Attribute
                "src"?: Attribute
                "type"?: Attribute
            } & AttributesGlobal
            section: {} & AttributesGlobal
            select: {
                "autocomplete"?: Attribute
                "disabled"?: Attribute
                "form"?: Attribute
                "multiple"?: Attribute
                "name"?: Attribute
                "required"?: Attribute
                "size"?: Attribute
            } & AttributesGlobal
            small: {} & AttributesGlobal
            source: {
                "media"?: Attribute
                "sizes"?: Attribute
                "src"?: Attribute
                "srcset"?: Attribute
                "type"?: Attribute
            } & AttributesGlobal
            span: {} & AttributesGlobal
            strike: {} & AttributesGlobal
            strong: {} & AttributesGlobal
            style: {
                "media"?: Attribute
                "scoped"?: Attribute
                "type"?: Attribute
            } & AttributesGlobal
            sub: {} & AttributesGlobal
            summary: {} & AttributesGlobal
            sup: {} & AttributesGlobal
            svg: {} & AttributesGlobal
            table: {
                "align"?: Attribute
                "background"?: Attribute
                "bgcolor"?: Attribute
                "border"?: Attribute
                "summary"?: Attribute
            } & AttributesGlobal
            tbody: {
                "align"?: Attribute
                "bgcolor"?: Attribute
            } & AttributesGlobal
            td: {
                "align"?: Attribute
                "background"?: Attribute
                "bgcolor"?: Attribute
                "colspan"?: Attribute
                "headers"?: Attribute
                "rowspan"?: Attribute
            } & AttributesGlobal
            template: {} & AttributesGlobal
            textarea: {
                "autocomplete"?: Attribute
                "cols"?: Attribute
                "dirname"?: Attribute
                "disabled"?: Attribute
                "enterkeyhint"?: Attribute
                "form"?: Attribute
                "inputmode"?: Attribute
                "maxlength"?: Attribute
                "minlength"?: Attribute
                "name"?: Attribute
                "placeholder"?: Attribute
                "readonly"?: Attribute
                "required"?: Attribute
                "rows"?: Attribute
                "wrap"?: Attribute
            } & AttributesGlobal
            tfoot: {
                "align"?: Attribute
                "bgcolor"?: Attribute
            } & AttributesGlobal
            th: {
                "align"?: Attribute
                "background"?: Attribute
                "bgcolor"?: Attribute
                "colspan"?: Attribute
                "headers"?: Attribute
                "rowspan"?: Attribute
                "scope"?: Attribute
            } & AttributesGlobal
            thead: {
                "align"?: Attribute
            } & AttributesGlobal
            time: {
                "datetime"?: Attribute
            } & AttributesGlobal
            title: {} & AttributesGlobal
            tr: {
                "align"?: Attribute
                "bgcolor"?: Attribute
            } & AttributesGlobal
            track: {
                "default"?: Attribute
                "kind"?: Attribute
                "label"?: Attribute
                "src"?: Attribute
                "srclang"?: Attribute
            } & AttributesGlobal
            tt: {} & AttributesGlobal
            u: {} & AttributesGlobal
            ul: {} & AttributesGlobal
            var: {} & AttributesGlobal
            video: {
                "autoplay"?: Attribute
                "buffered"?: Attribute
                "controls"?: Attribute
                "crossorigin"?: Attribute
                "height"?: Attribute
                "loop"?: Attribute
                "muted"?: Attribute
                "playsinline"?: Attribute
                "poster"?: Attribute
                "preload"?: Attribute
                "src"?: Attribute
                "width"?: Attribute
            } & AttributesGlobal
            wbr: {} & AttributesGlobal
            marquee: {
                "bgcolor"?: Attribute
                "loop"?: Attribute
            } & AttributesGlobal
            ontenteditabl: {
                "enterkeyhint"?: Attribute
                "inputmode"?: Attribute
            } & AttributesGlobal
            menu: {
                "type"?: Attribute
            } & AttributesGlobal
        }
    }
}
