import * as utils from '../utils'
import { log } from '../shared'

const { thro, exists, fileNames, read, write, handlebars } = utils

// my-script becomes my:script
const getNames = (dir) => fileNames(dir, false).map(getScriptName)
const getScriptName = (n='') => n.replace('.js', '').replace(/-/g, ':')
const getScriptFile = (n='') => n.replace('.js', '').replace(/:/g, '-') + '.js'


export default async ({ okk, dirs }) => {

  const createFlag = okk.flags.create || okk.flags.c
  const globalFlag = okk.flags.global || okk.flags.g

  const script = {}
  script.name = getScriptName(okk.input[0]) 
  script.file = getScriptFile(script.name)

  const paths = {
      local: `${dirs.pwd}/${dirs.scripts}`
    , global: `${dirs.global}/scripts`
  }

  const scripts = {
      local: getNames(`${paths.local}/*.js`)
    , global: getNames(`${paths.global}/*.js`)
    , all: {}
    , total: 0
  };

  ['local', 'global'].map(scope => {
    scripts[scope].map(s => { scripts.all[s] = `${paths[scope]}/${getScriptFile(s)}` })
  })

  scripts.total = Object.keys(scripts.all).length
  
  // if no script exists, or script not found, or script is ls
  if(!Object.keys(scripts.all).includes(script.name)){
    if(!script.name || script.name == 'ls'){
      log('available scripts :')
      log('> local', scripts.local)
      log('> global', scripts.global)
      return
    }

    if(createFlag){
      const createDir = paths[globalFlag ? 'global' : 'local']
      utils.mkdir(createDir)
      const SCRIPT = handlebars(read(`${__dirname}/../tpls/new-script.js`), { script: script.name })
      write(`${createDir}/${script.file}`, SCRIPT)
      log(`+ ${script.file}`)
      log(`new script "${script.name}" created in ${createDir}`)
    }else{
      log(`Hey, script "${script.name}" does not exist ! create one :`)
      log(`>  local:  oks ${script.name} --create`)
      log(`> global:  oks ${script.name} --create --global`)
    }
    return 
  }


  try {
    const verb = okk.flags.v || okk.flags.verbose
    
    script.path = `${scripts.all[script.name]}` 
    script.fn = (await import(script.path)).default
    script.ns = scripts.global.includes(script.name) ? 'global' : 'local'
    
    verb && log(`> running ${script.ns} script "${script.name}"`)
    verb && log(`> --------------------------------------------------`)
    const exit = await script.fn({ utils, okk, dirs })
    verb && log(`> --------------------------------------------------`)
    verb && log(`> script exit ${exit==0?0:1}`)
  }catch(e){
    log(`> script error`, e, e.message)    
  }
}