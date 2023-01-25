/* eslint-disable no-console */
const gitSemverTags = require('git-semver-tags');
const fs = require('fs');

gitSemverTags((err, tags) => {
  if (err) return;
  const obj = {
    version: tags[0],
  };
  fs.writeFileSync('version.json', JSON.stringify(obj), 'utf8');
  console.log(tags);
});
