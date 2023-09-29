# Light JSX &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/facebook/react/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/light-jsx.svg)](https://www.npmjs.com/package/light-jsx) [![bundle size](https://img.shields.io/bundlephobia/min/light-jsx.svg)](https://bundlephobia.com/package/light-jsx) [![typescript used](https://img.shields.io/npm/types/light-jsx)](typescriptlang.org)

Light JSX is a simple JavaScript library for creating reactive websites. It doesn't use any behind scene magic, like Virtual DOM or compilation, to render your apps, all JSX translated directly to nodes and updates them when state of your app changes.

# Examples

**Hello world example**

```
import { LightJSX } from "light-jsx"

// equal to <div>Hello world!</div>, surprising, isn't it?
let test = <div>Hello world!</div>

LightJSX.render(document.body, test)
```

**Counter example**

```
import { LightJSX, createSignal } from  "light-jsx"

const [val, setVal] = createSignal(0)

// equal to <div>Hello world!</div>, surprising, isn't it?
let test = <div>Hello world!</div>

LightJSX.render(document.body, test)
```
