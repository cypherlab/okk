import * as utils from '../utils'
import { log } from '../shared'

const { thro, exists } = utils

export default async ({ okk }) => {
  const pwd = utils.shell.pwd().stdout
  const script = {}

  script.name = okk.input[0]
  script.filename = `${script.name}${/\.js/.test(script.name) ? '':'.js'}` // append .js to filename
  script.path = `${pwd}/${okk.cfg('dirs.scripts')}/${script.filename}`

  if(!exists(script.path)) thro(`script "${script.path}" not found`)

  try {
    script.fn = (await import(script.path)).default
    log(`> running script "${script.name}"`)
    const exit = await script.fn({ utils, okk })
    log(`> script exit ${0}`)
  }catch(e){
    log(`> script error`, e, e.message)    
  }
}