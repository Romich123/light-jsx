import path from "path"
import { packageTemplate } from "./packageTemplate"
import { buildPath } from "./paths"
import fs from "fs"
import semver from "semver"
import { allVersions } from "./allversions"

let curVer: string | undefined = undefined

let currentInfoJson: string

try {
    const lastVersion = allVersions[allVersions.length - 1]

    if (lastVersion) {
        curVer = lastVersion.version
    } else {
        currentInfoJson = fs.readFileSync(path.resolve(buildPath, "./package.json")).toString()
        const currentInfo = JSON.parse(currentInfoJson)
        const valid = semver.valid((currentInfo?.version + "") as string)

        if (valid) {
            curVer = valid
        }
    }
} catch {}

if (!curVer) {
    curVer = packageTemplate.version
}

export const currentVersion: string = curVer
