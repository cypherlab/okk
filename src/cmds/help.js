import { write, read, exists, exec, shell, dirNames } from '../utils'
import { log } from '../shared'

export default async ({ okk }) => {
  const cmds = okk.cmds
  log(`okk commands: "${okk.cmds.join(', ')}"`)
}