import inquirer from "inquirer"
import path from "path"
import { simpleGit } from "simple-git"
import { sourcePath } from "./paths"

inquirer
    .prompt([
        {
            name: "commitMessage",
            message: "Git commit message: ",
        },
    ])
    .then((output: { commitMessage: string }) => {
        simpleGit(sourcePath)
            .add("-A")
            .commit(output.commitMessage)
            .push("origin", "main")
            .then((result) => {
                console.log(result)
            })
    })
