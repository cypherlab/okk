import { write, read, exists, dirNames } from '../utils'
import { log } from '../shared'

export default ({ okk }) => {
  const rcfile = okk.flags.name || okk.cfg('rcfile') || `.okkrc`
  const okkrc = exists(rcfile) ? read(rcfile, 'json') : {}

  okkrc.pkgs = dirNames('./pkgs')

  write(rcfile, okkrc, 'json')
  log(`${rcfile} file created !`, okkrc)

  return okkrc
}