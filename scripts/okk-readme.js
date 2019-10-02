
export default async ({ utils, okk }) => {

  const { log, handlebars, read, write } = utils

  // create README.md file
  const README = handlebars(read(`${okk.cfg('dirs.assets')}/README.md`), {})
  write(`./README.md`, README)
  log(`+ README.md`)
  // log(README)

  return 0
}