var DEFAULT_URLS = {
  select:'/select',
  tree:'/tree',
  paste:'/paste',
  children:'/children',
  deepchildren:'/deepchildren',
  item:'/item'
}

// get the route and handlers and an array of objects
module.exports = function getRoutes(baseOpts){
  baseOpts = baseOpts || {}

  if(!baseOpts.baseUrl) throw new Error('need a baseUrl option')
  if(!baseOpts.routeHandlers) throw new Error('need a routeHandlers option')

  // the parameter used to capture an item id
  var idParam = baseOpts.idParam || 'id'

  var urls = Object.assign({}, DEFAULT_URLS, baseOpts.urls || {})
  var baseUrl = baseOpts.baseUrl
  var routeHandlers = baseOpts.routeHandlers

  return [{
    // tree
    // GET /db/:project/:section/tree
    url:baseUrl + urls.tree,
    handlers:{
      GET:routeHandlers.tree
    }
  },{
    // select
    // GET /db/:project/:section/select
    url:baseUrl + urls.select,
    handlers:{
      GET:routeHandlers.select
    }
  },{
    // children
    // GET /db/:project/:section/children
    url:baseUrl + urls.children,
    handlers:{
      GET:routeHandlers.children
    }
  },{
    // children/id
    // GET /db/:project/:section/children/:id
    url:baseUrl + urls.children + '/:' + idParam,
    handlers:{
      GET:routeHandlers.children
    }
  },{
    // deepchildren
    // GET /db/:project/:section/deepchildren
    url:baseUrl + urls.deepchildren,
    handlers:{
      GET:routeHandlers.deepchildren
    }
  },{
    // deepchildren/id
    // GET /db/:project/:section/deepchildren/:id
    url:baseUrl + urls.deepchildren + '/:' + idParam,
    handlers:{
      GET:routeHandlers.deepchildren
    }
  },{
    // paste
    // POST /db/:project/:section/paste
    url:baseUrl + urls.paste,
    handlers:{
      POST:routeHandlers.paste
    }
  },{
    // paste
    // POST /db/:project/:section/paste/:id
    url:baseUrl + urls.paste + '/:' + idParam,
    handlers:{
      POST:routeHandlers.paste
    }
  },{
    // add
    // POST /db/:project/:section/item
    url:baseUrl + urls.item,
    handlers:{
      POST:routeHandlers.add
    }
  },{
    // CRUD (load,add,save,delete)
    // GET /db/:project/:section/item/:id
    // POST /db/:project/:section/item/:id
    // PUT /db/:project/:section/item/:id
    // DELETE /db/:project/:section/item/:id
    url:baseUrl + urls.item + '/:' + idParam,
    handlers:{
      GET:routeHandlers.load,
      POST:routeHandlers.add,
      PUT:routeHandlers.save,
      DELETE:routeHandlers.delete
    }
  }]
  
}