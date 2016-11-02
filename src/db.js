/*

  a folder-ui AJAX database implementation that maps data
  from the REST api (index.js)
  
*/

import Ajax from 'folder-ui/lib/db/ajax'

export default function ajaxdb(opts = {}){

  const loadTree = (data) => {
    
    // make a map of _digger.path and _digger.inode
    var pathMap = {}
    var rootNodes = []

    data = data.map(function(item){
      // give each node a proper id (based on _digger.diggerid)
      item.id = item._digger.diggerid
      pathMap[item._digger.path + '/' + item._digger.inode] = item
      return item
    })

    Object.keys(pathMap || {}).forEach(function(path){

      var item = pathMap[path]
      var parts = path.split('/')
      var inode = parts.pop()
      var parentPath = parts.join('/')
      var parent = pathMap[parentPath]

      // it's a root node
      if(!parent){
        rootNodes.push(item)
      }
      // we have a parent
      else{
        var children = parent.children || []
        children.push(item)
        parent.children = children
      }

    })

    return rootNodes
  }

  opts.mapFns = Object.assign({}, opts.mapFns, {
    loadTree
  })

  return Ajax(opts)

}