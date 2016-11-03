var handlers = require('./handlers')
var routeHandlers = require('./route_handlers')
var routes = require('./routes')
var router = require('./router')
var tools = require('./tools')

module.exports = function(baseOpts){
  baseOpts = baseOpts || {}

  if(!baseOpts.diggerurl) throw new Error('need a diggerurl option')
  if(!baseOpts.routeWrapper) throw new Error('need a routeWrapper option')
  if(!baseOpts.getParams) throw new Error('need a getParams option')
  if(!baseOpts.mountpoint) throw new Error('need a mountpoint option')
  if(!baseOpts.router) throw new Error('need a router option')

  // the backend handlers that load the data for each route
  var diggerHandlers = handlers({
    diggerurl:baseOpts.diggerurl
  })

  // the frontend routes
  var folderRouteHandlers = routeHandlers({
    handlers:diggerHandlers,
    routeWrapper:baseOpts.routeWrapper,
    getParams:baseOpts.getParams
  })

  // the route objects
  var folderRoutes = routes({
    idParam:baseOpts.idParam,
    baseUrl:baseOpts.mountpoint,
    routeHandlers:folderRouteHandlers
  })

  router({
    router:baseOpts.router,
    routes:folderRoutes
  })
}