import fs from 'fs'
import del from 'del'
import Handlebars from 'handlebars'
import Shell from 'shelljs'
import objectPath from 'object-path'


export const log = console.log
export const Log = (debug, logger=console.log) => (...args) => (debug&&args[0]&&logger(...args))

export const thro = (e) => { throw new Error(e) }

export const resolvePath = objectPath

export const shell = Shell

export const exec = async (cmd, options) => {
  return new Promise((solv, ject) => {
    shell.exec(cmd, {silent:true}, function(code, stdout, stderr) {
      // console.log('code', code)
      // console.log('stdout', stdout)
      // console.log('stderr', stderr)
      if(!code) solv(stdout)
      else ject(stderr)
    })
  })
}

export const getPwd = () => shell.pwd().stdout

export const pwdImport = async (path) => {
  const p = `${getPwd()}/${path}`
  const m = await import(p)
  return m
}

export const exists = path => {
  const exist = fs.existsSync(path)
  return exist ? path : false
}

export const mkdir = dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  return dir
}

export const rmdir = async dir => {
  return await del([dir])
}

// dirNames('./parent') => ["child1", "child2"]
export const dirNames = (dir) => {
  // ./parent => ./parent/*/
  // ./parent/* => ./parent/*/
  // ./parent/*/ => ./parent/*/
  dir = /\/$/.test(dir) ? dir : /\*$/.test(dir) ? `${dir}/` : `${dir}/*/`

  const names = shell
    .ls('-d', `${dir}`)
    .stdout
    .replace(/\n$/, "") // remove last line break
    .split('\n')
    .map(d => {
      d = d.split('/')
      d = d[d.length - 2]
      return d
    })

  return names
}

// fileNames('./parent') => ["foo.js", "bar.js"]
export const fileNames = (dir) => {
  const names = shell
    .exec(`ls -p ${dir} | grep -v /`, {silent:true})
    .stdout
    .replace(/\n$/, "") // remove last line break
    .split('\n')

  return names
}


// filesPaths('/lib/*/package.json') => ["/lib/foo/package.json", "/lib/bar/package.json"]
export const filesPaths = (dir) => {
  const paths = shell
    .ls(`${dir}`)
    .stdout
    .replace(/\n$/, "") // remove last line break
    .split('\n')

  return paths
}

// loadFiles(["/lib/foo/package.json", "/lib/bar/package.json"], "json") => [{}, {}]
// loadFiles("/lib/*/package.json", "json") => [{}, {}]
export const loadFiles = (paths, json) => {
  if(typeof paths == 'string')
  paths = filesPaths(paths)
  return paths.map(p => read(p, json))
}

export const handlebars = (source, data) => {
  const template = Handlebars.compile(source)
  return template(data)
}

export const read = (file, json) => {
  const data = fs.readFileSync(file, 'utf-8')
  return json ? JSON.parse(data) : data
}

export const write = (file, data, json) => {
  data = json ? JSON.stringify(data, null, 2) : data
  return fs.writeFileSync(file, data, 'utf-8')
}

// parseName('@babel/node') => { name: '@babel/node', ns1: 'babel', ns2: 'node' }
export const parseName = (name) => {
  const p = { name, ns1: name, ns2: name }
  const s = name.split('/')

  if(s.length == 2){
    p.ns1 = s[0].replace('@', '')
    p.ns2 = s[1]
  }

  return p
}