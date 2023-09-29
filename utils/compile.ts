const packageTemplate = {
    "name": "light-jsx",
    "version": "0.3.3",
    "description": "Light implementation of JSX, that produces DOM nodes and allows for reactivity.",
    "keywords": ["jsx"],
    "author": "Romich123",
    "license": "MIT",
    "main": "index.js",
    "types": "index.d.ts",
    "scripts": {
        "build": "tsc --declaration",
        "release": "npm run build && npx changeset publish",
        "lint": "tsc",
    },
    "devDependencies": {
        "@changesets/cli": "^2.26.2",
        "typescript": "^5.2.2",
    },
    "bugs": {
        "url": "https://github.com/Romich123/light-jsx/issues",
    },
    "repository": {
        "type": "git",
        "url": "git+https://github.com/Romich123/light-jsx.git",
    },
    "homepage": "https://github.com/Romich123/light-jsx#readme",
    "publishConfig": {
        "access": "public",
    },
}
