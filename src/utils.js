const moment = require("moment");
const terminalLink = require("terminal-link");
const { darker } = require("./draw");

module.exports = {
  filterProjects: (projects, selectedProjectNamesOrIds) => {
    const projectIdsOrNamesArr = selectedProjectNamesOrIds
      .toString()
      .split(",")
      .map(x => x.trim());
    const filteredProjects = projects.filter(({ id, name }) => {
      return (
        projectIdsOrNamesArr.includes(`${id}`) ||
        projectIdsOrNamesArr.includes(name)
      );
    });

    if (filteredProjects.length) {
      return filteredProjects;
    }
  },

  buildTable: ({ participants, mergeRequests, projects, user }) =>
    participants.reduce(
      ({ reviewed, unreviewed }, { data }, i) => {
        const {
          title,
          author,
          created_at,
          web_url,
          project_id
        } = mergeRequests[i];
        const table2push = data.find(
          ({ username }) => username === user.username
        )
          ? reviewed
          : unreviewed;

        table2push.push({
          MR: title,
          author: darker(author.username),
          project: darker(projects.find(({ id }) => project_id === id).name),
          created: moment(created_at).fromNow(true),
          "gitlab ⚓️": darker(terminalLink("[cmd/ctrl + click] ->", web_url))
        });

        return { reviewed, unreviewed };
      },
      { reviewed: [], unreviewed: [] }
    )
};
