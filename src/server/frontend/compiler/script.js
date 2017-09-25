// js 脚本编译

const _scripts = {}

// 原始脚本编译
const scriptCompile = async (name, filePath) => {
  if (_scripts[name]) return _scripts[name]

  const scripts = _scripts[name] = filePath
  return scripts
}

// script compile
const compiler = async ({name, js, deps}) => {
  let scripts = new Set()

  // dependencies
  if (deps.length) {
    const scriptsDeps = await Promise.all(deps.map(compiler))
    scripts = scriptsDeps.reduce((items, scriptDeps) => {
      scriptDeps.forEach(items.add, items)
      return items
    }, scripts)
  }

  const script = await scriptCompile(name, js)
  scripts.add(script)

  return scripts
}

module.exports = compiler
