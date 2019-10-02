# `@cypherlab/okk`


<p align="center">
  <img width="250" alt="screenshot" src="https://user-images.githubusercontent.com/503577/66052337-c05caa00-e530-11e9-8e43-1d242ae7aa39.png">
</p>
<p align="center">
  🤖 Enhanced workflows for lazy programmers
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/{{project.name}}">
    <img alt="npm version" src="https://img.shields.io/npm/v/@cypherlab/okk">
  </a>
  <img alt="lisence" src="https://img.shields.io/npm/l/@cypherlab/okk">
</p>

---

Whatever project you're working on, `okk` gives you access (via the command line) to a set of tools and commands that you can use to optimize your development workflows and manage your projects.


## Install via NPM
```
yarn global add @cypherlab/okk
```

## Commands

### init

```bash
okk init // create/update .okkrc file
```

### script

Run a custom script

```bash
okk script // show all script
okk script foo // run ./scripts/foo.js
```

A script must exports a default async function:

```js
export default async ({ utils, okk }) => {
  // pull some utils fonctions
  const { pwdImport, shell } = utils

  // import some random file from your current project folder
  const { default: users } = await pwdImport('./assets/users.js')  

  // echo data
  shell.echo(users.join(''))

  // return a valid exit code (0,1,2)
  return 0
}
```

From there, you have access to okk utility functions (via `utils`), and also to the okk instance (via `okk`)

by default, `okk` looks into a `./scripts` folder for scripts. To change the default path add `dirs.scripts` path in your `.okkrc` file.

```json
{
  "dirs": 
    "scripts": "./pathToScriptsFolder"
  }
}
```


## Install from local repo
```
// clone this repo
git clone git@github.com:cypherlab/okk.git

// install package globaly 
yarn run link

// update okk
git pull
yarn run link

// delete okk
yarn run unlink 

// work on okk codebase:
// first unlink global okk yarn package
// then work in the repo, when done reinstall package globaly 
yarn run unlink
// work
yarn run link
```

