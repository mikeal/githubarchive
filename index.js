var util = require('util')
  , stream = require('stream')
  , path = require('path')
  , fs = require('fs')
  , zlib = require('zlib')
  , jsonstream = require('JSONStream')
  , timezone = require('timezone')
  , request = require('request').defaults({pool:{maxSockets:1}})
  ;

function CallbackStream (cb) {
  this.readable = true
  this.writable = true
  this.cb = cb
}
util.inherits(CallbackStream, stream.Stream)
CallbackStream.prototype.write = function (chunk) {
  this.emit('data', chunk)
}
CallbackStream.prototype.end = function () {
  this.emit('close')
  this.cb()
}
CallbackStream.prototype.destory = function () {}

module.exports = function (arg) {
  if (arg.slice(0, 'http://'.length) === 'http://' || arg.slice(0, 'http://'.length) === 'http://') {
    return module.exports.request(arg)
  }
  return module.exports.readFile(arg)
}

module.exports.languages = function (cb) {
  var languages = {}
  var s = new CallbackStream(function () {
    cb(null, languages)
  })
  s.languages = languages
  s.on('data', function (d) {
    if (!d.repository) return 
    if (!languages[d.repository.language]) languages[d.repository.language] = 0
    languages[d.repository.language] += 1
  })
  s.on('error', cb)
  return wrap(s)
}

module.exports.users = function (cb) {
  var users = {}
  var s = new CallbackStream(function () {
    cb(null, users)
  })
  s.users = users
  s.on('data', function (d) {
    if (!s.users[d.actor]) s.users[d.actor] = {}
  })
  s.on('error', cb)
  return wrap(s)
}

module.exports.commits = function (cb) {
  var commits = {}
  var s = new CallbackStream(function () {
    cb(null, commits)
  })
  s.commits = {}
  s.on('data', function (d) {
    if (d.type === 'PushEvent') {
      d.payload.shas.forEach(function (sha) {
        s.commits[sha[0]] = [d.owner, d.name, sha[1]]
      })
    }
  })
  s.on('error', cb)
  return wrap(s)
}

function wrap (obj) {
  Object.keys(module.exports).forEach(function (i) {
    obj[i] = function () { return obj.pipe(module.exports[i].apply(module.exports, arguments)) }
  })
  obj.once('write', function () {
    Object.keys(module.exports).forEach(function (i) {
      obj[i] = function () { throw new Error('Cannot ask for new parsing after the first write.') }
    })
  })
  obj.on('end', function () {
    Object.keys(module.exports).forEach(function (i) {
      obj[i] = function () { throw new Error('Cannot ask for new parsing after the stream has ended.') }
    })
  })
  return obj
}

module.exports.request = function (url) {
  return wrap(request(url).pipe(zlib.createGunzip()).pipe(jsonstream.parse()))
}

module.exports.readFile = function (path, options) {
  var f = fs.createReadStream(path)
    , z = new zlib.createGunzip() 
    , j = jsonstream.parse()
  
  if (options.gzip !== false) {
    f.pipe(z)
    z.pipe(j)
  } else {
    f.pipe(j)
  }
  
  return wrap(j)
}

module.exports.range = function (start, end) {
  // I get Access Denied for any range I try to use in the HTTP interface
  // this is why we do a GET per hour and pipe them all together.
  // This also solves some timeout and throttling issues.
  var timestamps = []
  if (end < start) throw new Error('end is before start')
  console.log(start, end)
  var s = new Date(start)
  while (end > s) {
    timestamps.push(timezone(s, '%Y-%m-%d-%k').replace(/\ /g, ''))
    s.setHours(s.getHours()+1)
  }
  
  var output = new CallbackStream(function () {}) // noop for end
  
  timestamps.forEach(function (ts) {
    var r = request('http://data.githubarchive.org/'+ts+'.json.gz')
    r.on('response', function (resp) {
      output.emit('timerange', ts)
      if (resp.statusCode !== 200) {
        console.error('not 200', 'http://data.githubarchive.org/'+ts+'.json.gz')
        return
      }
      
      var z = new zlib.createGunzip()
        , j = jsonstream.parse()
        ;  
      j.on('data', function (obj) {
        var created = new Date(obj.created_at)
        if (created < start) return
        if (created > end) return
        output.emit('data', obj)
      })
      resp.pipe(z)
      z.pipe(j)
      
      if (timestamps.indexOf(ts) === timestamps.length - 1) j.on('end', output.end.bind(output))
    })
  })
  
  return wrap(output)
}


