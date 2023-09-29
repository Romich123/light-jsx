import inquirer from "inquirer"
import semver from "semver"
import { currentVersion } from "./currentVersion"
import { packageTemplate } from "./packageTemplate"
import { writePackage } from "./writePackage"
import fs from "fs"
import path from "path"
import { json } from "stream/consumers"
import { generateChanglog } from "./generateChangelog"
import { sourcePath } from "./paths"

let changelogText: string

try {
    changelogText = fs.readFileSync(path.resolve(__dirname, "./changelog.json")).toString()
} catch {
    changelogText = "{}"
}

const changelog = JSON.parse(changelogText)

inquirer
    .prompt([
        {
            type: "list",
            name: "releaseType",
            message: "Select an option:",
            choices: ["patch", "minor", "major"],
        },
        {
            type: "editor",
            name: "changes",
            message: "What changed?",
        },
    ])
    .then((output: { releaseType: "patch" | "minor" | "major"; changes: string }) => {
        const releaseType = output.releaseType

        const newVer = semver.inc(currentVersion, releaseType)!

        const newPack = structuredClone(packageTemplate)

        newPack.version = newVer

        writePackage(newPack)

        changelog[newVer] = {
            date: new Date().toUTCString(),
            changes: output.changes,
        }

        fs.writeFileSync(path.resolve(__dirname, "./changelog.json"), JSON.stringify(changelog, null, "\t"))

        const markdown = generateChanglog(changelog)

        fs.writeFileSync(path.resolve(sourcePath, "./CHANGELOG.md"), markdown)
    })
