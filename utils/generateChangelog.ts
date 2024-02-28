import semver from "semver"

function pad(num: number, char: string, size: number) {
    let str = num.toString()

    while (str.length < size) {
        str = char + str
    }

    return str
}

// generates .md file
export function generateChanglog(changelog: { [k: string]: { date: string; changes: string } }) {
    const versions = Object.keys(changelog)
        .sort(semver.compare)
        .map((key) => ({ ...changelog[key], version: key }))
        .filter((ver) => ver.changes && ver.changes !== "nothing" && ver.changes !== "empty" && ver.changes !== "hello")

    let result: string[] = []

    for (const ver of versions) {
        const date = new Date(ver.date)
        result.push(`## ${ver.version} (${pad(date.getDate(), "0", 2)}-${pad(date.getMonth() + 1, "0", 2)}-${date.getFullYear()})\n${ver.changes}\n`)
    }

    result = result.reverse()

    return "# Changelog\n" + result.join("")
}
