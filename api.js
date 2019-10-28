const axios = require('axios')

let _apiUrl

const _hitApi = (url) => axios(_apiUrl + url)

const _getProjectMergeRequests = (pId) => _hitApi(`/projects/${pId}/merge_requests/?state=opened&scope=all`)

const _flattenResponseData = (arr) => arr.reduce((flattened, {data}) => ([...flattened, ...data]), [])

module.exports = {
  setup: ({TOKEN, SERVER}) => {
    _apiUrl = SERVER + '/api/v4'
    axios.defaults.headers.common['Private-Token'] = TOKEN
  },
  getUser: () => _hitApi(`/user`),
  getUserProjects: () => _hitApi(`/projects?min_access_level=30`),
  getMergeRequests: (projects) => {

      const requests = []
      for (const project of projects) {
        requests.push(_getProjectMergeRequests(project.id))
      }

      return Promise.all(requests).then((responses) => ({
        mergeRequests: _flattenResponseData(responses),
        projects
      }))
  },
  getParticipants: ({project_id, iid}) => _hitApi(`/projects/${project_id}/merge_requests/${iid}/participants`)

}
