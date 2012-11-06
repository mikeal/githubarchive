var archive = require('../index')
  , path = require('path')
  , assert = require('assert')
  , _ = require('underscore')
  ;


var a = archive.readFile(path.join(__dirname, 'september.json'), {gzip:false})
var com = a.commits(function (err, commits) {
  console.log(Object.keys(com.commits).length, _.uniq(Object.keys(com.commits).map(function (s) {return com.commits[s][2]})).length)
  console.log('done')
})
