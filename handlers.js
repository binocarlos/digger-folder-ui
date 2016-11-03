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

    var baseid = opts.id ? '=' + opts.id + ' ' : ''
    var path = '/select/'+ opts.path + '?selector=' + encodeURIComponent(baseid + '*:tree')
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
    var path = '/select/'+ opts.path + '?selector=' + encodeURIComponent(baseid + ' > *')
    var url = getUrl(path)

    bhttp.get(url, {
      decodeJSON:true
    }, function(err, res){
      if(err) return done(err)
      var data = res.body || []
      done(null, data)
    })
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
      done(null, data)
    })
  }

  function saveItem(req, opts, done){

    opts = opts || {}

    var url = getUrl('/item/' + opts.id)

    bhttp.put(url, req, {
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

  function cutProcessor(data){
    delete(data._digger.path)
    data._children = (data._children || []).map(cutProcessor)
    return data
  }

  function copyProcessor(data){
    delete(data._digger.inode)
    delete(data._digger.path)
    delete(data._digger.diggerid)
    delete(data._digger.created)
    data._children = (data._children || []).map(copyProcessor)
    return data
  }

  // process the data before we paste it
  var pasteProcessors = {

    // leave digger fields apart from path
    cut:function(arr){
      return arr.map(cutProcessor)
    },

    // remove all digger fields as though it's fresh data
    copy:function(arr){
      return arr.map(copyProcessor)
    }
  }

  function pasteItems(req, opts, done){
    req.pipe(concat(function(body){

      // parse the incoming packet which is
      // {
      //   mode:{cut,copy},
      //   data:[...]
      // }
      try {
        body = JSON.parse(body.toString())
      } catch (e){
        return done(e.toString())
      }

      var mode = body.mode || 'copy'
      var data = body.data || []

      if(!pasteProcessors[mode]){
        return done('unknown paste type: ' + mode)
      }

      async.waterfall([

        // load the tree for each node
        function(next){

          async.parallel(data.map(function(item){
            return function(nextitem){
              loadTree({
                path:opts.path,
                id:item._digger.diggerid
              }, function(err, treedata){
                if(err) return nextitem(err)
                var root = utils.combine_tree_results(treedata) || []
                nextitem(null, root[0])
              })
            }
          }), function(err, data){
            if(err) return next(err)
            data = data || []
            data = data.filter(function(result){
              return result
            })
            
            next(null, data)
          })
        },

        // if we are doing a 'cut' then we delete first
        // TODO: this is bad - we should do this atomically in the digger-rest server
        function(pasteItems, next){
          if(mode=='copy') return next(null, pasteItems)
          async.parallel(data.map(function(item){
            return function(nextitem){
              deleteItem({
                id:item._digger.diggerid
              }, nextitem)
            }
          }), function(err, data){
            if(err) return next(err)
            next(null, pasteItems)
          })
        },

        // we now have an array of full tree items
        // and should add them to the parent
        function(pasteItems, next){

          // first pre-process the paste data (recursivly)
          pasteItems = pasteProcessors[mode](pasteItems)
          addItem(JSON.stringify(pasteItems), opts, next)

        }

      ], function(err, results){
        if(err) return done(err)
        return done(null, results)
      })
      
    }))
  }

  return {
    loadTree:loadTree,
    loadChildren:loadChildren,
    loadItem:loadItem,
    addItem:addItem,
    saveItem:saveItem,
    deleteItem:deleteItem,
    pasteItems:pasteItems
  } 
}