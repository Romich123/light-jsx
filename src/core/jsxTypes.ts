export namespace JSX {
    export type Element = Rendered
    export type Attribute = string | number | bigint | boolean | null | undefined | (() => Attribute)
    export type Input<
        T extends {
            [k: string]: any
        } = {},
        C = JSX.Element
    > =
        | ((
              props: T & {
                  children: C[]
              },
              children: C[]
          ) => Rendered | Rendered[] | Element)
        | ((
              props: T & {
                  children: C[]
              }
          ) => Rendered | Rendered[])
        | (() => Rendered | Rendered[] | Element)
        | string
    export type Rendered = Node
    export type Convinience = string | bigint | number | null

    export type Child = Rendered | Convinience | (() => Convinience) | (() => Rendered)

    export type StyleAttribute = { [k in keyof CSSStyleDeclaration as k extends string ? (CSSStyleDeclaration[k] extends Function ? never : k) : never]: CSSStyleDeclaration[k] } & {
        [k: string]: string
    }

    export type AttributesGlobal = { [k: string]: Attribute } & {
        [k in `data-${string}`]?: Attribute
    } & {
        "accesskey"?: Attribute
        "autocapitalize"?: Attribute
        "class"?: Attribute
        "contenteditable"?: Attribute
        "contextmenu"?: Attribute
        "dir"?: Attribute
        "draggable"?: Attribute
        "hidden"?: Attribute
        "id"?: Attribute
        "itemprop"?: Attribute
        "lang"?: Attribute
        "role"?: Attribute
        "slot"?: Attribute
        "spellcheck"?: Attribute
        "style"?: StyleAttribute | (() => StyleAttribute)
        "tabindex"?: Attribute
        "title"?: Attribute
        "translate"?: Attribute
    } & Partial<{
            onfullscreenchange: (this: Element, ev: Event) => any
            /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenerror_event) */
            onfullscreenerror: (this: Element, ev: Event) => any
        }> &
        Partial<GlobalEventHandlers>

    export type IntrinsicElements = { [k: string]: any } & {
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
