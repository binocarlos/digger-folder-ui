var bhttp = require('bhttp')

module.exports = function(baseOpts){
  baseOpts = baseOpts || {}

  if(!baseOpts.url) throw new Error('need a url option')

  function getUrl(path){
    return [baseOpts.url, path].filter(function(part){
      return part && part.length>0
    }).map(function(part){
      return part.replace(/^\//, '')
    }).join('/')
  }

  function loadTree(opts, done){
    opts = opts || {}

    var path = '/select/'+ opts.path + '?selector=' + encodeURIComponent('*:tree')
    var url = getUrl(path)

    bhttp.get(url, {
      decodeJSON:true
    }, function(err, res){
      if(err) return done(err)
      var data = res.body || []
      done(null, data)
    })
  }

  function addItem(req, opts, done){

    opts = opts || {}

    var path = opts.id ?
      // we are adding by id deep into a tree
      '/item/' + opts.id :
      // we are adding to a root node with a path
      '/path/' + opts.path

    var url = getUrl(path)

    bhttp.post(url, req, {
      decodeJSON:true
    }, function(err, res){
      if(err) return done(err)
      var data = res.body

      // process data

      done(null, data)
    })
  }

  return {
    loadTree:loadTree,
    addItem:addItem
  }
}