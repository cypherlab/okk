import meow from 'meow'
import _ from 'lodash'
import { shell, thro, read, exists, exec, filesPaths, resolvePath, getPwd } from './utils'
import { log } from './shared'
import * as allCommands from './cmds'
import PkgsManager from './pkgs'


;(async () => {

  const cli = meow(`
    Usage
      $ okk <cmd> [pkgs] --flags

    Options
      --ack,          dry run by default, specify this option to run real
      --clean,        delete kit files

    Examples
      $ okk script heroku:log
  `, {
    flags: {
        ack: { type: 'boolean' }
      , rc: { type: 'string' }
    }
  })


  // ARGS
  let input = cli.input
  const flags = cli.flags
  const dry = !flags.ack ? true : false

  // overide first arg with cmd alias (used for okk script => oks)
  if(process.env.OKK_CMD_ALIAS){
    input = [ process.env.OKK_CMD_ALIAS, ...input ]
  }

  const rcfile = flags.rc || '.okkrc'

  let okkrc 
  try { okkrc = exists(rcfile) ? read(rcfile, 'json') : {} }
  catch(e){ return log(`.okkrc file json syntax error`) }

  const okkcfg = _.merge({
      rcfile
    , dirs: {
          global: '~/.okk'
        , pkgs: './pkgs'
        , assets: './assets'
        , scripts: './scripts'
      }
    , pkgs: []
  }, okkrc)

  // replace relative path with absolute
  if(/^~/.test(okkcfg.dirs.global)){
    okkcfg.dirs.global = okkcfg.dirs.global.replace(/^~/, shell.env.HOME)
  }

  // add pwd dir to dirs
  okkcfg.dirs.pwd = getPwd()

  // PREPARE okk
  const okk = {}
  okk.cmds = Object.keys(allCommands)
  okk.cmd = input[0]
  okk.input = input.slice(1)
  okk.flags = flags
  okk.dry = dry
  okk.cfg = (k) => k ? resolvePath.get(okkcfg, k) : okkcfg

  if(!okk.cmds.includes(okk.cmd)) okk.cmd = 'help' //thro(`404 command, use [${okk.cmds.join(',')}]`)


  // INIT PkgsManager
  const pkger = new PkgsManager(okk, { log: true, logRuns: true })


  // RUN FN
  const run = cmd => allCommands[cmd]({ 
      okk
    , dirs: okkcfg.dirs
    , pkger
  })

  // RUN COMMAND
  await run(okk.cmd)


  // PKGS
  // const pkgs = input[0] ? [input[0]] : meta.get('pkgs')
  // log(`[scope:${pkgs.length}] ${pkgs.join(',')}`)

  // pkgs.forEach(pkg => {
  //   log(`\n### package "${pkg}" ####\n`)

  //   if(meta.exists(pkg)){
  //     if(flags.pull) meta.run(pkg, 'git st')

  //   }else{
  //   }

  //   log(`--------------------`)
  // })


})()