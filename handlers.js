var bhttp = require('bhttp')
var async = require('async')
var concat = require('concat-stream')
var utils = require('digger-utils')

module.exports = function handlers(baseOpts){

  baseOpts = baseOpts || {}

  if(!baseOpts.diggerurl) throw new Error('need a diggerurl option')

  function getUrl(path){
    return [baseOpts.diggerurl, path].filter(function(part){
      return part && part.length>0
    }).map(function(part){
      return part.replace(/^\//, '')
    }).join('/')
  }

  function loadTree(opts, done){
    opts = opts || {}
    var selector = opts.query ? 
      opts.query :
      '*:tree'
    var path = '/select/'+ opts.path + '?selector=' + encodeURIComponent(selector)
    var url = getUrl(path)

    bhttp.get(url, {
      decodeJSON:true
    }, function(err, res){
      if(err) return done(err)
      var data = res.body || []
      done(null, data)
    })
  }

  function loadSelector(opts, done){
    opts = opts || {}

    var path = '/select/'+ opts.path + '?selector=' + encodeURIComponent(opts.selector)
    var url = getUrl(path)

    bhttp.get(url, {
      decodeJSON:true
    }, function(err, res){
      if(err) return done(err)
      var data = res.body || []
      done(null, data)
    })
  }


  function loadChildren(opts, done){
    opts = opts || {}

    var baseid = opts.id ? '=' + opts.id : ''
    var path = '/select/'+ opts.path + '?selector=' + encodeURIComponent(baseid + ' > *' + (opts.tree ? ':tree' : ''))
    var url = getUrl(path)

    bhttp.get(url, {
      decodeJSON:true
    }, function(err, res){
      if(err) return done(err)
      var data = res.body || []
      done(null, data)
    })
  }

  function loadDeepChildren(opts, done){
    loadChildren(Object.assign({}, opts, {
      tree:true
    }), done)
  }

  function loadItem(opts, done){
    var url = getUrl('/item/' + opts.id)

    bhttp.get(url, {
      decodeJSON:true
    }, function(err, res){
      if(err) return done(err)
      var data = res.body || []
      done(null, data[0])
    })
  }

  function addItem(opts, done){

    opts = opts || {}

    var path = opts.id ?
      // we are adding by id deep into a tree
      '/item/' + opts.id :
      // we are adding to a root node with a path
      '/path/' + opts.path

    var url = getUrl(path)

    bhttp.post(url, opts.req, {
      decodeJSON:true
    }, function(err, res){
      if(err) return done(err)
      var data = res.body
      done(null, data)
    })
  }

  function saveItem(opts, done){

    opts = opts || {}

    var url = getUrl('/item/' + opts.id)

    bhttp.put(url, opts.req, {
      decodeJSON:true
    }, function(err, res){
      if(err) return done(err)
      var data = res.body
      done(null, data)
    })
  }

  function deleteItem(opts, done){
    var url = getUrl('/item/' + opts.id)

    bhttp.delete(url, {
      decodeJSON:true
    }, function(err, res){
      if(err) return done(err)
      done()
    })
  }

  return {
    loadTree:loadTree,
    loadSelector:loadSelector,
    loadChildren:loadChildren,
    loadDeepChildren:loadDeepChildren,
    loadItem:loadItem,
    addItem:addItem,
    saveItem:saveItem,
    deleteItem:deleteItem
  } 
}