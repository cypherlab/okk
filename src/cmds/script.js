import * as utils from '../utils'
import { log } from '../shared'

const { thro, exists, fileNames, read, write, handlebars } = utils

export default async ({ okk, dirs }) => {

  const script = { name: okk.input[0] }
  const gFlag = okk.flags.g || okk.flags.global

  // if no script provided, default to ls
  if(!script.name || script.name == 'ls'){
    const lookup = gFlag 
      ? `${dirs.global}/scripts/*.js`
      : `${dirs.pwd}/${dirs.script}/*.js`

    const scriptNames = fileNames(lookup, false).map(s => s.replace('.js', ''))

    return scriptNames.length
      ? log(`${gFlag?'global ':''}scripts list`, scriptNames)
      : log('no scripts yet ! create new script with: \n> okk script script-name --create')
  }

  script.filename = `${script.name}${/\.js/.test(script.name) ? '':'.js'}` // append .js to filename
  script.path = gFlag 
    ? `${dirs.global}/scripts/${script.filename}`
    : `${dirs.pwd}/${dirs.scripts}/${script.filename}`

  // script does not exist locally
  if(!exists(script.path)){

    // try global
    script.global = `${dirs.global}/scripts/${script.filename}`

    if(!exists(script.global)){

      // auto create with --create
      if(okk.flags.create){
        // get & make script dir
        const scriptsDir = okk.flags.global ? script.global : dirs.scripts
        utils.mkdir(scriptsDir)
        
        const SCRIPT = handlebars(read(`${__dirname}/../tpls/new-script.js`), { script: script.name })
        write(`${scriptsDir}/${script.name}.js`, SCRIPT)
        log(`+ ${script.name}.js`)
        log(`new script "${script.name}" created in ${scriptsDir}`)
        return
      }else{
        log(`script "${script.name}" not found. create new script with:`)
        log(`> "okk script ${script.name} --create" or "okk script ${script.name} --create --global"`)
        return
      }
    }else{
      script.path = script.global
      script.global = true
    }
  } 

  try {
    const raw = true || okk.flags.raw
    script.fn = (await import(script.path)).default
    !raw && log(`> running script "${script.name}" ${script.global?'from global':''}`)
    !raw && log(`> --------------------------------------------------`)
    const exit = await script.fn({ utils, okk, dirs })
    !raw && log(`> --------------------------------------------------`)
    !raw && log(`> script exit ${exit==0?0:1}`)
  }catch(e){
    log(`> script error`, e, e.message)    
  }
}