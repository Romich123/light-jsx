import { packageTemplate } from "./packageTemplate"
import fs from "fs"
import path from "path"
import { buildPath, sourcePath } from "./paths"
import { currentVersion } from "./currentVersion"
import { writePackage } from "./writePackage"

const newPackage = structuredClone(packageTemplate)

newPackage.version = currentVersion

writePackage(newPackage)

fs.copyFileSync(path.resolve(sourcePath, "./README.md"), path.resolve(buildPath, "./README.md"))
fs.copyFileSync(path.resolve(sourcePath, "./LICENSE"), path.resolve(buildPath, "./LICENSE"))
