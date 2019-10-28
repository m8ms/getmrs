const fs = require('fs')
const api = require('./api.js')
const inquirer = require('inquirer')
const { highlight } = require('./draw')

module.exports = async function createConfig(configPath) {
	const config = await inquirer.prompt([
		{
			type: 'input',
			name: 'server',
			message: 'Gitlab server address',
			filter: str => str.trim(),
		},
		{
			type: 'input',
			name: 'token',
			message: 'Gitlab token',
			filter: str => str.trim(),
		},
	])

	api.setup(config)

	const { data } = await api.getUserProjects()
	const choices = data.map(({ name }) => name)

	const { projects } = await inquirer.prompt({
		type: 'checkbox',
		name: 'projects',
		message: 'Projects you want to review (can be overriden with: "getmrs -p comma,sepparated,names; no selection == "all")',
		choices
	})

	fs.writeFile(
		configPath,
		JSON.stringify({
			...config,
			...projects.length && { projects }
		}),
		(err) => {
			if (err) throw err;
			console.log(
				`\nConfig saved to:\n${highlight(configPath)}\nRun script again to start using.\n`
			);
		})
}
