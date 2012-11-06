var archive = require('../index')
  , path = require('path')
  , fs = require('fs')
  ;

var range = archive.range(new Date('2012-09-01Z'), new Date('2012-09-02Z'))
  , writer = fs.createWriteStream(path.join(__dirname, 'range.json'))
  ;

range.on('data', function (o) {
  writer.write(JSON.stringify(o))
})
range.on('end', writer.end.bind(writer))

range.on('timerange', console.log.bind(console))