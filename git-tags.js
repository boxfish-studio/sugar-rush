const gitSemverTags = require("git-semver-tags");
const fs = require("fs");

gitSemverTags(function (err, tags) {
  if (err) return;
  const obj = {
    version: tags[0],
  };
  fs.writeFileSync("version.json", JSON.stringify(obj), "utf8");
  console.log(tags);
});