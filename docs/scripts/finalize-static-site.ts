const output = `${import.meta.dir}/../dist/client`
const shell = Bun.file(`${output}/_shell.html`)

if (!(await shell.exists())) {
  throw new Error('TanStack Start SPA shell is missing')
}

const html = await shell.text()
await Promise.all([
  Bun.write(`${output}/index.html`, html),
  Bun.write(`${output}/404.html`, html),
  // GitHub Pages otherwise runs Jekyll over the output and drops underscore paths.
  Bun.write(`${output}/.nojekyll`, ''),
])

console.log('static SPA shell promoted to index.html and 404.html')
