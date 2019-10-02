import * as utils from '../utils'
import { log } from '../shared'

const { thro, exists, fileNames, read, write, handlebars } = utils

export default async ({ okk }) => {
  const pwd = utils.shell.pwd().stdout
  const scriptNames = fileNames(`${pwd}/${okk.cfg('dirs.scripts')}/*.js`, false).map(s => s.replace('.js', ''))
  const scriptDir = okk.cfg('dirs.scripts')
  const script = {}

  script.name = okk.input[0]

  // if no script provided, default to ls
  if(!script.name || script.name == 'ls'){
    return scriptNames.length
      ? log('scripts list', scriptNames)
      : log('no scripts yet ! create one with')
  }

  script.filename = `${script.name}${/\.js/.test(script.name) ? '':'.js'}` // append .js to filename
  script.path = `${pwd}/${scriptDir}/${script.filename}`

  // script does not exist
  if(!exists(script.path)){
    // auto create with --create
    if(okk.flags.create){
      const SCRIPT = handlebars(read(`${__dirname}/../tpls/new-script.js`), { script: script.name })
      write(`${scriptDir}/${script.name}.js`, SCRIPT)
      log(`+ ${script.name}.js`)
      log(`new script "${script.name}" created in ${scriptDir}`)
      return
    }else{
      log(`script "${script.name}" not found. create new script with:`)
      log(`> okk script ${script.name} --create`)
      return
    }
  } 

  try {
    script.fn = (await import(script.path)).default
    log(`> running script "${script.name}"`)
    const exit = await script.fn({ utils, okk })
    log(`> script exit ${0}`)
  }catch(e){
    log(`> script error`, e, e.message)    
  }
}