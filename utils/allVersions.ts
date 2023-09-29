import fs from "fs"
import path from "path"
import semver from "semver"

let changelogText: string

try {
    changelogText = fs.readFileSync(path.resolve(__dirname, "./changelog.json")).toString()
} catch {
    changelogText = "{}"
}

const changelog = JSON.parse(changelogText) as { [k: string]: { changes: string; date: string } }

export const allVersions = Object.keys(changelog)
    .sort(semver.compare)
    .map((key) => ({ ...changelog[key], version: key }))
