const parseArgs = require('minimist')
const moment = require('moment')
const clc = require('cli-color')
const terminalLink = require('terminal-link')
const columnify = require('columnify')
const api = require('./api.js')

require('dotenv-flow').config()

const args = parseArgs(process.argv.slice(2))

const TOKEN = args.t || process.env.GITLAB_TOKEN
const SERVER = args.s || process.env.GITLAB_SERVER
const PROJECTS = args.p || process.env.GITLAB_PROJECTS

const TABLE_OPTS = {
  columnSplitter: '  ⎸ ',
  headingTransform: heading => clc.xterm(46)(heading),
}

moment.locale('pl')

const SPACER = {
  'MR': '',
  'autor': '',
  'projekt': '',
  'wisi już...': '',
  'gitlab ⚓️': ''
}

api.setup({
  TOKEN,
  SERVER,
})

api.getUser().then(({data:user}) => {
  api.getUserProjects()
    .then(filterProjects)
    .then(api.getMergeRequests)
    .then(getParticipants)
    .then((data) => drawTable({...data, user}))
})

function filterProjects({data: projects}) {
  if (PROJECTS) {
    const projectIdsOrNamesArr = PROJECTS.toString().split(',').map(x => x.trim())
    const filteredProjects = projects.filter(({id, name}) => {
      return projectIdsOrNamesArr.includes(`${id}`) || projectIdsOrNamesArr.includes(name)
    })

    if (filteredProjects.length) {
      return filteredProjects
    }
  }
  return projects
}

function getParticipants({mergeRequests, projects}) {
  const promises = mergeRequests.map((mergeRequest) => api.getParticipants(mergeRequest))

  return Promise.all(promises).then((responses) => ({responses, mergeRequests, projects}))
}

function drawTable({responses, mergeRequests, projects, user}) {
  const data = responses.reduce(({reviewed, unreviewed}, {data}, i) => {
    const {title, author, created_at, web_url, project_id} = mergeRequests[i]
    const table2push = data.find(({username}) => username === user.username) ? reviewed : unreviewed

    table2push.push({
      'MR': title,
      'autor': darker(author.username),
      'projekt': darker(projects.find(({id}) => project_id === id).name),
      'wisi już...': moment(created_at).fromNow(true),
      'github ⚓️': darker(terminalLink('[cmd/ctrl + click] ->', web_url))
    })

    return {reviewed, unreviewed}
  }, {reviewed: [], unreviewed: []})

  draw(data)
}

function draw(data) {
  data.unreviewed.unshift(SPACER)
  data.reviewed.unshift(SPACER)

  console.log(darker('\nodwiedzone:'))
  console.log(darker('------------------------------\n'))
  console.log(darker(columnify(data.reviewed, {...TABLE_OPTS, headingTransform: x => x})))

  console.log(highlight('\n\n\n\ntu Cię nie było:'))
  console.log(highlight('------------------------------\n'))
  console.log(columnify(data.unreviewed, TABLE_OPTS))
  console.log(highlight('\n\n\n\n\n\n'))
}


const highlight = clc.xterm(123)
const darker = clc.xterm(240)
