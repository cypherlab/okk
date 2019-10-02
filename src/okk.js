import meow from 'meow'
import _ from 'lodash'
import { thro, read, exists, exec, filesPaths, resolvePath } from './utils'
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
      $ okk clone some-repo
  `, {
    flags: {
        ack: { type: 'boolean' }
      , rc: { type: 'string' }
    }
  })

  // ARGS
  const input = cli.input
  const flags = cli.flags
  const dry = !flags.ack ? true : false

  const rcfile = flags.rc || '.okkrc'
  const okkrc = exists(rcfile) ? read(rcfile, 'json') : {}
  const okkcfg = _.merge({
      rcfile
    , dirs: {
          pkgs: './pkgs'
        , assets: './assets'
        , scripts: './scripts'
      }
    , pkgs: []
  }, okkrc)

  // PREPARE okk
  const okk = {}
  okk.cmds = Object.keys(allCommands)
  okk.cmd = input[0]
  okk.input = input.slice(1)
  okk.flags = flags
  okk.dry = dry
  okk.cfg = (k) => k ? resolvePath.get(okkcfg, k) : okkcfg

  if(!okk.cmds.includes(okk.cmd)) okk.cmd = 'dsl' //thro(`404 command, use [${okk.cmds.join(',')}]`)


  // INIT PkgsManager
  const pkger = new PkgsManager(okk, { log: true, logRuns: true })


  // RUN FN
  const run = cmd => allCommands[cmd]({ 
      okk
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