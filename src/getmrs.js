const fs = require('fs')
const os = require('os')
const path = require('path')
const parseArgs = require('minimist')
const api = require('./api')
const createConfig = require('./createConfig')
const { filterProjects, buildTable } = require('./utils')
const { slightlyDarker, draw } = require('./draw')

const args = parseArgs(process.argv.slice(2))

const FORCE_CONFIG = args.c
const CONFIG_FILE_PATH = path.join(os.homedir(), '.getmrs_config')

if (FORCE_CONFIG) {
	createConfig(CONFIG_FILE_PATH)
} else {
	try {
		const config = fs.readFileSync(CONFIG_FILE_PATH)
		run(JSON.parse(config))
	} catch (err) {
		if (err.code === 'ENOENT') {
			console.log('First, we must generate a config file at: ' + CONFIG_FILE_PATH + '\n')
			console.log(slightlyDarker('You can overwrite this config later by running "getmrs -c"\n'))
			createConfig(CONFIG_FILE_PATH)
		} else {
			console.error(err)
		}
	}
}

async function run(config) {
	api.setup(config)
	const { data: user } = await api.getUser()

	const { data: projects } = await api.getUserProjects()
	const selectedProjectNamesOrIds = args.p || process.env.GITLAB_PROJECTS || config.projects
	const filteredProjects = selectedProjectNamesOrIds ? filterProjects(projects, selectedProjectNamesOrIds) : projects

	const mergeRequests = await api.getMergeRequests(filteredProjects)
	const participants = await api.getParticipants(mergeRequests)
	const data = buildTable({ participants, mergeRequests, projects, user })
	draw(data)
}
