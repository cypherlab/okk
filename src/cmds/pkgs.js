import { write, read, exists, exec, shell, dirNames } from '../utils'
import { log } from '../shared'

export default async ({ okk }) => {
  const pkgsNames = dirNames(okk.cfg('dirs.pkgs'))
  log(pkgsNames)
  return pkgsNames
}