var archive = require('../index')
  , path = require('path')
  , assert = require('assert')
  , _ = require('underscore')
  , fs = require('fs')
  ;


var a = archive.readFile(path.join(__dirname, 'september.json'), {gzip:false})
var com = a.commits(function (err, commits) {
  fs.writeFile(path.join__dirname, 'septcommits', JSON.stringify(commits))
})
