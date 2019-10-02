import { thro } from '../utils'
import { log } from '../shared'

export default ({ okk }) => {
  log(`Invalid command. Try "${okk.cmds.join(', ')}"`)
  // log(`active commands are`, okk.cmds)
}