const fs = require('fs')
const os = require('os')
const path = require('path')
const parseArgs = require('minimist')
const moment = require('moment')
const clc = require('cli-color')
const terminalLink = require('terminal-link')
const columnify = require('columnify')
const api = require('./api')
const createConfig = require('./createConfig')

const args = parseArgs(process.argv.slice(2))

const FORCE_CONFIG = args.c
const CONFIG_FILE_PATH = path.join(os.homedir(), '.getmrs_config')

if(!FORCE_CONFIG) {
	try {
		const config = fs.readFileSync(CONFIG_FILE_PATH)
		runApp(JSON.parse(config))
	} catch (err) {
		if (err.code === 'ENOENT') {
			console.log('First, we must generate a config file at: ' + CONFIG_FILE_PATH + '\n')
			console.log(clc.xterm(247)('You can overwrite this config later by running "getmrs -c"\n'))
			createConfig(CONFIG_FILE_PATH)
		} else {
			console.error(err)
		}
	}
} else {
	createConfig(CONFIG_FILE_PATH)
}

const TABLE_OPTS = {
	columnSplitter: '  ⎸ ',
	headingTransform: heading => clc.xterm(46)(heading),
}

const SPACER = {
	'MR': '',
	'author': '',
	'project': '',
	'created': '',
	'gitlab ⚓️': ''
}

async function runApp(config) {
	api.setup(config)
	const {data: user} = await api.getUser()

	const {data: projects} = await api.getUserProjects()
	const selectedProjectNamesOrIds = args.p || process.env.GITLAB_PROJECTS || config.projects
	const filteredProjects = selectedProjectNamesOrIds ? filterProjects(projects, selectedProjectNamesOrIds) : projects

	const mergeRequests = await api.getMergeRequests(filteredProjects)
	const participants = await api.getParticipants(mergeRequests)
	drawTable({participants, mergeRequests, projects, user})
}

function filterProjects(projects, selectedProjectNamesOrIds) {
	const projectIdsOrNamesArr = selectedProjectNamesOrIds.toString().split(',').map(x => x.trim())
	const filteredProjects = projects.filter(({id, name}) => {
		return projectIdsOrNamesArr.includes(`${id}`) || projectIdsOrNamesArr.includes(name)
	})

	if (filteredProjects.length) {
		return filteredProjects
	}
}

function drawTable({participants, mergeRequests, projects, user}) {
	const data = participants.reduce(({reviewed, unreviewed}, {data}, i) => {
		const {title, author, created_at, web_url, project_id} = mergeRequests[i]
		const table2push = data.find(({username}) => username === user.username) ? reviewed : unreviewed

		table2push.push({
			'MR': title,
			'author': darker(author.username),
			'project': darker(projects.find(({id}) => project_id === id).name),
			'created': moment(created_at).fromNow(true),
			'gitlab ⚓️': darker(terminalLink('[cmd/ctrl + click] ->', web_url))
		})

		return {reviewed, unreviewed}
	}, {reviewed: [], unreviewed: []})

	draw(data)
}

function draw(data) {
	data.unreviewed.unshift(SPACER)
	data.reviewed.unshift(SPACER)

	console.log(darker('\nparticipating:'))
	console.log(darker('------------------------------\n'))
	console.log(darker(columnify(data.reviewed, {...TABLE_OPTS, headingTransform: x => x})))

	console.log(highlight('\n\n\n\nMerge requests you haven\'t seen:'))
	console.log(highlight('------------------------------\n'))
	console.log(columnify(data.unreviewed, TABLE_OPTS))
	console.log(highlight('\n\n\n\n\n\n'))
}


const highlight = clc.xterm(123)
const darker = clc.xterm(240)
