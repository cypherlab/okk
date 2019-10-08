import { write, read, exists, exec, shell, dirNames, parseLibName } from '../utils'
import { log } from '../shared'

export default async ({ okk, pkger, dirs }) => {
  const cmd = okk.input[0]
  const pkgsNames = dirNames(dirs.pkgs)

  if(!cmd){
    log(`# pkgs commands :`)
    log(`-----------------`)
    log(`> pkgs ls // list project packages`)
    log(`> pkgs add [repo/name] // clone a repo in your packages`)
    return 
  }

  if(cmd=='ls'){
    return log(`> packages list`, pkgsNames)
  }

  if(cmd=='add'){
    let pkg = okk.input[1]

    if(!pkg){
      log(`must specify a package name, ex :`)
      log(`> okk pkgs add larafale/react-flow`)
      return 
    }

    pkg = parseLibName(pkg, okk.cfg('git.user'))

    if(!pkg.ns1) return log(`must provide a "git.user" config in .okkrc`)

    const pkgName = okk.input[2] || pkg.ns2

    // if pkg already exist return
    if(pkger.exists(pkgName)) thro(`pkg "${pkg.ns2}" already exists !`)

    const cmd = `git clone ${pkg.repo} ${dirs.pkgs}/${pkgName}`

    // we redirect stderr to stdout 2>&1 for git clone, because git clone always return stderr.
    if(okk.flags.ack) await pkger.run(`${cmd} 2>&1`)
    else {
      log(`> ${cmd}`)
      log(`# confirm with --ack flag`)
    }

  } 

}