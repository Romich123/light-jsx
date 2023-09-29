import path from "path"
import { buildPath } from "./paths"
import fs from "fs"

export function writePackage(newPackage: { [k: string]: any }) {
    const packageWrite = fs.createWriteStream(path.resolve(buildPath, "./package.json"))
    packageWrite.write(JSON.stringify(newPackage, null, "\t"))
    packageWrite.end()
}
