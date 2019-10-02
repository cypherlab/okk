import { thro } from '../utils'
import { log } from '../shared'

export default async ({ okk, meta }) => {
  let [ pkg, pkgName ] = okk.input
  let repo
  if(!pkg) thro(`must specify a package name`)


  if(/git@github/.test(pkg) || /^https/.test(pkg)){
    repo = pkg
    pkg = pkgName || repo.split('/')[repo.split('/').length-1].replace('.git', '')
  }else{
    if(!okk.cfg('repo')) thro(`must provide a "repo" config in .rc`)
    repo = `${okk.cfg('repo')}/${pkg}.git`
  }

  // if pkg exist throw
  if(meta.exists(pkg)) thro(`pkg "${pkg}" already exists !`)

  // we redirect stderr to stdout for git clone, because git clone always return stderr.
  const cmd = `git clone ${repo} ${okk.cfg('dirs.pkgs')}/${pkg} 2>&1`

  if(okk.flags.ack) await meta.run(cmd)
  else log('> confirm by running command with --ack flag')
}