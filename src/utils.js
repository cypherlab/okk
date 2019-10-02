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


// #############
// return clean file names array of specified dir or files
// > fileNames('./parent') => ["foo.js", "bar.txt", ".baz"]
// > fileNames('./parent', false) => ["foo.js", "bar.txt"]
// > fileNames('./parent/*.js') => ["foo.js"]
export const fileNames = (dir, showHidden=true) => {
  const names = shell.exec(`ls -ap ${dir}`, {silent:true})

  // command did not match anything
  if(names.stderr) return []

  return names.stdout
    .replace(/\n$/, "") // remove last line break
    .split('\n')
    .filter(n => {
      if(n[n.length-1] == '/') return false
      if(!showHidden && n[0]=='.') return false
      return true
    })
    .map(n => {
      n = n.split('/')
      n = n[n.length - 1]
      return n
    })
}

// #############
// filesPaths('/lib/*/package.json') => ["/lib/foo/package.json", "/lib/bar/package.json"]
export const filesPaths = (dir) => {
  const paths = shell
    .ls(`${dir}`)
    .stdout
    .replace(/\n$/, "") // remove last line break
    .split('\n')

  return paths
}

// #############
// Copy source file to destination
// Third args is used either as an object, for handlebar templates
// or as a function, for json transforms
export const copyFile = (source, dest, subs = {}) => {
  if(typeof subs == 'function'){ // we want json parse
    write(dest, subs(read(source, 'json')), 'json')
  }else{
    write(dest, handlebars(read(source), subs))
  }
}

// #############
// Define a copy flow, and copy files by their names and not their paths
//
// Exemple: 
// > const bake = copyFlow('./src', './dst')
// > bake('foo.txt') // copy file 'src/foo.txt' to './dst/foo.txt'
//
// Second argument is either an 
//   - object, for handlebars template subs
//   - function, for json transform
//
// ex: interpolate data with handlebar {{sub}} 
// > bake('README.md', { sub1: 'foo', sub2: 'bar' })
//
// 2) copy json file and change some params
// > bake('package.json', pkg => {
//     pkg.name = 'foo'
//     pkg.description = 'bar'
//     return pkg
//   })
export const copyFlow = (source, dest) => {
  return (file, subs = {}) => copyFile(`${source}/${file}`, `${dest}/${file}`, subs)
}

// #############
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

// #############
// parseLibName('@babel/node') => { name: '@babel/node', ns1: 'babel', ns2: 'node' }
// parseLibName('foobar', 'larafale') => { name: 'foobar', ns1: 'larafa', ns2: 'node' }
export const parseLibName = (name, user) => {
  const p = { name, ns1: name, ns2: name }
  let s

  if(/github.com:/.test(p.name)){
    s = name.split(':')[1].replace('.git', '')
    p.ns1 = s.split('/')[0]
    p.ns2 = s.split('/')[1]
    p.name = p.ns2
  }else if(/^github.com\//.test(p.name)){
    s = name.split('github.com/')[1].replace('.git', '')
    p.ns1 = s.split('/')[0]
    p.ns2 = s.split('/')[1]
    p.name = p.ns2
  }else{
    s = name.split('/')
    if(s.length == 2){
      p.ns1 = s[0].replace('@', '')
      p.ns2 = s[1]
    }else{
      p.ns1 = user || false
    }
  }

  p.github = `https://github.com/${p.ns1}/${p.ns2}`
  p.repo = `${p.github}.git`

  return p
}