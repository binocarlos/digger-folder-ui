var tools = require('./tools')

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

      var args = passReq ? [req] : []
      args.push(getParams(opts.params))
      args.push(errorWrapper(res, function(data){
        res.setHeader('Content-type', 'application/json')
        res.end(JSON.stringify(data))
      }))

      handler.apply(null, args)
    })
  }

  return {
    tree:getHandler('tree', handlers.loadTree),
    children:getHandler('children', handlers.loadChildren),
    deepchildren:getHandler('deepchildren', handlers.loadDeepChildren),
    load:getHandler('load', handlers.loadItem),
    add:getHandler('add', handlers.addItem, true),
    save:getHandler('save', handlers.saveItem, true),
    delete:getHandler('delete', handlers.deleteItem)
  }
}