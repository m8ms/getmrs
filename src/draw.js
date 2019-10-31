const clc = require("cli-color");
const columnify = require("columnify");

const TABLE_OPTS = {
  columnSplitter: "  ⎸ ",
  headingTransform: heading => clc.xterm(46)(heading)
};

const SPACER = {
  MR: "",
  author: "",
  project: "",
  created: "",
  "gitlab ⚓️": ""
};

const highlight = clc.xterm(123);
const darker = clc.xterm(240);
const slightlyDarker = clc.xterm(246);

module.exports = {
  draw(data) {
    data.unreviewed.unshift(SPACER);
    data.reviewed.unshift(SPACER);

    console.log(slightlyDarker("\nparticipating:"));
    console.log(slightlyDarker("------------------------------\n"));
    console.log(
      slightlyDarker(
        columnify(data.reviewed, { ...TABLE_OPTS, headingTransform: x => x })
      )
    );

    console.log(highlight("\n\n\n\nMerge requests you haven't seen:"));
    console.log(highlight("------------------------------\n"));
    console.log(columnify(data.unreviewed, TABLE_OPTS));
    console.log(highlight("\n\n\n\n\n\n"));
  },
  highlight,
  darker,
  slightlyDarker
};
