var archive = require('../index')
  , path = require('path')
  , assert = require('assert')
  ;



var users = archive.readFile(path.join(__dirname, 'september.json'), {gzip:false}).users(function (err, users) {
  check()
  console.log('done')
})

function check () {
  // users.users
}
check()

setInterval(check, 10 * 1000)