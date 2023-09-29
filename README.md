# Light JSX &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Romich123/light-jsx/blob/main/LICENSE) &middot; [![npm version](https://img.shields.io/npm/v/light-jsx.svg?color=blue)](https://www.npmjs.com/package/light-jsx) &middot; [![bundle size](https://img.shields.io/bundlephobia/min/light-jsx.svg)](https://bundlephobia.com/package/light-jsx) &middot; [![typescript used](https://img.shields.io/npm/types/light-jsx)](typescriptlang.org)

Light JSX is a simple JavaScript library for creating reactive websites. It doesn't use any behind scene magic, like Virtual DOM or compilation, to render your apps, all JSX translated directly to nodes and updates them when state of your app changes.

-   **No compilation step**. Your app doesn't need any additional compilation steps. Typescript will do everything needed.
-   **Light**. Package size is 2 times less than other popular JSX libraries.
-   **Native**. Every JSX turns into DOM nodes, that makes debugging less painfull.
-   **Simple**. It's very easy to understand, especially if you used JSX libraries before.
-   **Fine grained reactivity**. DOM changes only when and where needed.

## Instalation

First, install light-jsx.

```
npm i light-jsx
```

Then add this lines to your tsconfig.json.

```
    "jsx": "react",
    "jsxFactory": "LightJSX.DOMcreateElement",
    "jsxFragmentFactory": "LightJSX.Fragment"
```

And you are ready to start!

## Examples

**Hello world example**

```ts
import { LightJSX } from "light-jsx"

// equal to <div>Hello world!</div>, surprising, isn't it?
let hello = <div>Hello world!</div>

LightJSX.render(document.body, hello)
```

**Counter example**

```ts
import { LightJSX, createSignal } from "light-jsx"

// creating state
// val = Getter<number>
// setVal = Setter<number>
const [val, setVal] = createSignal(0)

// changing state on click and displaying it
let counter = <button onclick={() => setVal((c) => c + 1)}>Count: {val}</button>

LightJSX.render(document.body, counter)
```

**Computed example**

```ts
import { LightJSX, createComputed, createSignal } from "light-jsx"

// creating state
// val = Getter<number>
// setVal = Setter<number>
const [val, setVal] = createSignal(0)

// creating computed
const double = createComputed(() => val() * 2)

// changing state on click and displaying it
let counter = (
    <>
        <button onclick={() => setVal((c) => c + 1)}>Count: {val}</button>
        <div>double: {double}</div>
    </>
)

LightJSX.render(document.body, counter)
```

**Effect example**

In this app a() + b() will be equal to sum() in any case

```ts
import { LightJSX, createEffect, createSignal } from "light-jsx"

// states
const [a, setA] = createSignal(0)
const [b, setB] = createSignal(0)
const [sum, setSum] = createSignal(0)

// effects
// every time sum or b changes, this code will run
createEffect(() => {
    setA(sum() - b())
})

// every time sum or a changes, this code will run
createEffect(() => {
    setB(sum() - a())
})

// keep in mind, that effects will run once immediately after they setup

// rendering multiple elements using fragment
const app = (
    <>
        <button onclick={() => setA((a) => a + 1)}>{a}</button>
        <span>+</span>
        <button onclick={() => setB((b) => b + 1)}>{b}</button>
        <span>=</span>
        <button onclick={() => setSum((sum) => sum + 1)}>{sum}</button>
    </>
)

LightJSX.render(document.body, app)
```

**Function components**

```ts
import { LightJSX, createEffect, createSignal } from "light-jsx"

// function component with props type declaration
// also keep in mind, that it will be called once per component
function StrangeCalculator(props: { initialSum?: number }) {
    const [a, setA] = createSignal(0)
    const [b, setB] = createSignal(0)
    const [sum, setSum] = createSignal(props.initialSum ?? 0)

    createEffect(() => {
        setA(sum() - b())
    })

    createEffect(() => {
        setB(sum() - a())
    })

    // styles
    return (
        <div style={{ "padding": "6px" }}>
            <button onclick={() => setA((a) => a + 1)}>{a}</button>
            <span>+</span>
            <button onclick={() => setB((b) => b + 1)}>{b}</button>
            <span>=</span>
            <button onclick={() => setSum((sum) => sum + 1)}>{sum}</button>
        </div>
    )
}

// rendering multiple components won't break anything
LightJSX.render(document.body, <StrangeCalculator initialSum={10} />)
LightJSX.render(document.body, <StrangeCalculator />)
LightJSX.render(document.body, <StrangeCalculator initialSum={100} />)
```

## **How it works**

As you might point out getter is function, but when passing it as JSX child we don't call it.
Every function passed as JSX child is considered state dependand and will be rerendered every time signals used inside it changes.

This code will log every time val is changed, because getVal is dependand on it.

```
import { LightJSX, createSignal } from "light-jsx"

const [val, setVal] = createSignal(0)

const getVal = () => {
    console.log("getting value: ", val())
    return val()
}

let counter = <button onclick={() => setVal((c) => c + 1)}>Count: {getVal}</button>

LightJSX.render(document.body, counter)
```

Based on this you may already guessed how poor use of library would look.

**Bad code examples**. Don't repeat it at home.

```ts
// this won't update at all, because there are no function
// functions is the key for reactivity
let badCounter1 = <button onclick={() => setVal((c) => c + 1)}>Count: {val()}</button>

// this will update
// but instead of rendering element once, it will rerender everything every time val changes
let badCounter2 = () => <button onclick={() => setVal((c) => c + 1)}>Count: {val()}</button>

let double = () => val() * 2
// this code will compute double 8 times
// instead you can use createComputed, that will run calculations once
let overlyExaggeratedExample = (
    <div>
        {double} {double} {double} {double} {double} {double} {double} {double}
    </div>
)
```

## Happy coding!
