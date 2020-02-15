var convertToJSON = function(data, origin) {
  return (origin == 'cloc') ? convertFromClocToJSON(data) : convertFromWcToJSON(data);
};

/**
 * Convert the output of cloc in csv to JSON format
 *
 *  > cloc . --csv --exclude-dir=vendor,tmp --by-file --report-file=data.cloc
 */
var convertFromClocToJSON = function(data) {
  var lines = data.split("\n");
  lines.shift(); // drop the header line

  var json = {};
  lines.forEach(function(line) {
    var cols = line.split(',');
    var filename = cols[1];
    if (!filename) return;
    var elements = filename.split(/[\/\\]/);
    var current = json;
    elements.forEach(function(element) {
      if (!current[element]) {
        current[element] = {};
      }
      current = current[element];
    });
    current.language = cols[0];
    current.size = parseInt(cols[4], 10);
  });

  json = getChildren(json)[0];
  json.name = 'root';

  return json;
};


var getChildren = function(json) {
  var children = [];
  if (json.language) return children;
  for (var key in json) {
    var child = { name: key };
    if (json[key].size) {
      // value node
      child.size = json[key].size;
      child.language = json[key].language;
    } else {
      // children node
      var childChildren = getChildren(json[key]);
      if (childChildren) child.children = childChildren;
    }
    children.push(child);
    delete json[key];
  }
  return children;
};