const gittags = require('git-tags');
const fs = require('fs');
gittags.get((err, tags) => {
  if (err) throw err;
  const obj = {
    version: tags[0],
  };
  fs.writeFileSync('version.json', JSON.stringify(obj), 'utf8');
  console.log(tags);
});
