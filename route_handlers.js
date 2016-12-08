var tools = require('./tools')
var url = require('url')

function getQuery(endpoint){
  return url.parse(endpoint, true).query
}

// generate route handlers without knowledge of where they are mounted
module.exports = function getRouteHandlers(baseOpts){

  baseOpts = baseOpts || {}

  if(!baseOpts.handlers) throw new Error('need a handlers option')
  if(!baseOpts.routeWrapper) throw new Error('need a routeWrapper option')
  if(!baseOpts.getParams) throw new Error('need a getParams option')

  var handlers = baseOpts.handlers
  var routeWrapper = baseOpts.routeWrapper
  var getParams = baseOpts.getParams
  var errorWrapper = tools.errorWrapper

  // passReq is if the backend-handler expects
  // the req passed as the first argument (so it can get the POST data)
  function getHandler(action, handler, passReq){
    return routeWrapper({
      action:action
    }, function(req, res, opts){

      // inject the backend id + path based on the route params
      // also inject the query params (for example for ?query=)
      var handlerOpts = Object.assign({}, getParams(opts.params), getQuery(req.url), {
        req:req,
        route:opts
      })

      handler(handlerOpts, errorWrapper(res, function(data){
        res.setHeader('Content-type', 'application/json')
        res.end(JSON.stringify(data))
      }))
    })
  }

  return {
    tree:getHandler('tree', handlers.loadTree),
    select:getHandler('select', handlers.loadSelector),
    children:getHandler('children', handlers.loadChildren),
    deepchildren:getHandler('deepchildren', handlers.loadDeepChildren),
    load:getHandler('load', handlers.loadItem),
    add:getHandler('add', handlers.addItem, true),
    save:getHandler('save', handlers.saveItem, true),
    delete:getHandler('delete', handlers.deleteItem)
  }
}