var archive = require('../index')
  , path = require('path')
  , assert = require('assert')
  , _ = require('underscore')
  , fs = require('fs')
  , jsonstream = require('JSONStream')
  ;

var f = fs.createReadStream(path.join(__dirname, 'september.json'))
  , j = jsonstream.parse()
  , current = 0
  ;

var size = fs.statSync(path.join(__dirname, 'september.json')).size

f.on('data', function (c) {
  current += c.length
})
f.pipe(j)

var commits = {}
  , commiters = {}
  ;

j.on('data', function (d) {
  if (d.type === 'PushEvent') {
    d.payload.shas.forEach(function (sha) {
      if (!commiters[sha[1]]) commiters[sha[1]] = []
      if (commiters[sha[1]].indexOf(sha[0]) === -1) commiters[sha[1]].push(sha[0])
    })
  }
})
j.once('data', check)

j.on('end', function () {
  console.log(Object.keys(commiters).length) 
  
  fs.writeFile(path.join(__dirname, 'usercommits.json'), JSON.stringify(commiters))
  
  clearInterval(interval)
})

function check () {
  console.log((current / size * 100)+'%')
}

var interval = setInterval(check, 60 * 1000)