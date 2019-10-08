import { shell } from '../utils'
import { log } from '../shared'

export default async ({ okk, dirs }) => {
  const cmds = okk.cmds
  log(`okk commands: "${okk.cmds.join(', ')}"`)
}