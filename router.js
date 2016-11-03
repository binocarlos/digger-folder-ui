// mount the routes onto a http-hash-router
module.exports = function setRoutes(baseOpts){
  baseOpts = baseOpts || {}

  if(!baseOpts.router) throw new Error('need a router option')
  if(!baseOpts.routes) throw new Error('need a routes option')

  var routes = baseOpts.routes
  var router = baseOpts.router

  routes.forEach(function(route){
    router.set(route.url, route.handlers)
  })
}