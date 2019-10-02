import { read, write, handlebars, exec, loadFiles } from '../utils'
import { log } from '../shared'

export default ({ okk }) => {

  const pkgs = loadFiles(`${okk.cfg('dirs.pkgs')}/*/package.json`, 'json')

  const pkgsList = pkgs
    .sort((a, b) => (a.name.localeCompare(b.name)))
    .map(pkg => (`\n- [${pkg.name}](${pkg.repository}) - ${pkg.description}`))
    .join('')

  // create README.md file
  const README = handlebars(read(`${okk.cfg('dirs.assets')}/README.md`), { 
    pkgs: { list: pkgsList }
  })
  
  write(`./README.md`, README)
  log(`+ README.md`)
  log(README)
}