import { read, write, exists, handlebars, exec, resolvePath } from './utils'
import { log } from './shared'

const PkgsManager = function(okk, options) {
  this.options = {
      logRuns: true
    , ...options
  }
}

PkgsManager.prototype.exists = function(pkg) {
  const path = `${okk.cfg('dirs.pkgs')}/${pkg}`
  return exists(path)
}

PkgsManager.prototype.pkgPath = function(pkg) {
  return exists(`${okk.cfg('dirs.pkgs')}/${pkg}`)
}

PkgsManager.prototype.run = async function(pkg, cmd, options) {
  if(!cmd){
    cmd = pkg 
    pkg = false
  }else{
    options = { cwd: this.pkgPath(pkg), ...options }
  }

  log(`> running command ${cmd}`, options||'')
  const stdout = await exec(cmd, options)

  this.options.logRuns&&log(stdout)
  return stdout
}

export default PkgsManager