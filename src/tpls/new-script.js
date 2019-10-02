export default async ({ utils, okk }) => {

  // pull some utils fonctions
  const { pwdImport, shell } = utils

  // import some random file from your current project folder
  // const { default: users } = await pwdImport('./assets/users.js')

  // echo data
  shell.echo('my new script "{{script}}" is running !')

  // return a valid exit code (0,1,2)
  return 0

}