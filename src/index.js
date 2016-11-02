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

      
      // make a map of _digger.path
      var pathMap = {}
      // make a map of path -> children
      var childrenMap = {}
      var rootPaths = []
      data = data.map(function(item){
        // give each node a proper id (based on _digger.diggerid)
        item.id = item._digger.diggerid
        pathMap[item._digger.inode] = item
        childrenMap[item._digger.inode] = []
        return item
      })

      Object.keys(pathMap || {}).forEach(function(path){

        var item = pathMap[path]
        // this is a root node
        if(item._digger.path==opts.path){
          rootIds.push(path)
        }
        else{
          var parts = path.split('/')
          parts.pop()
          var parentPath = parts.join('/')
          childrenMap[parentPath]
        }
        
      })

      
      data.or

      console.log('-------------------------------------------');
      console.log(JSON.stringify(data, null, 4))

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