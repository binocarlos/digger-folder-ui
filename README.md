# digger-folder-ui

REST API bridge server between [folder-ui](https://github.com/binocarlos/folder-ui) clients and [digger-rest](https://github.com/binocarlos/digger-rest) backends

## install

```bash
$ npm install digger-folder-ui --save
$ yarn add digger-folder-ui
```

## usage

```javascript
const path = require('path')
const url = require('url')
const morgan = require('morgan')
const HttpHashRouter = require('http-hash-router')
const concat = require('concat-stream')

const bhttp = require("bhttp")
const diggerFolderUI = require('digger-folder-ui')
const diggerFolderUITools = require('digger-folder-ui/tools')

const logger = morgan('combined')
const VERSION = require(path.join(__dirname, '..', 'package.json')).version

const tools = require('./tools')
const Auth = require('./auth')

module.exports = function(opts){

  opts = opts || {}

  var router = HttpHashRouter()
  

  // TODO: this is a placeholder atm
  var auth = Auth({

  })

  var errorWrapper = diggerFolderUITools.errorWrapper

  // loads the user using the cookie
  //
  // then calls the auth.project handler with:
  //   * project (from url)
  //   * section (from url)
  //   * action (from route)
  //   * params (from url)
  //   * user (from auth service)
  //
  // then writes the user and all props of the wrapper opts
  // to the params for the actual request

  function routeWrapper(wrapperOpts, handler){
    return function(req, res, opts){
      tools.loadUser(req.headers.cookie, errorWrapper(res, function(user){
        auth.project({
          project:opts.params.project,
          section:opts.params.section,
          action:wrapperOpts.action,
          params:opts.params,
          user:user
        }, errorWrapper(res, function(info){
          opts.params.user = user
          Object.keys(wrapperOpts || {}).forEach(function(key){
            opts.params[key] = wrapperOpts[key]
          })
          handler(req, res, opts)
        }))
      }))
    }
  }

  // extract the values from opts.params based on the route
  // these values are passed in the backend handlers
  function getParams(params){
    return {
      // the item id based on '/:id'
      id:params.id,

      // BACKEND DIGGER PATH
      // /db/123/resources/children/:id -> project/123/resources
      path:[
        'project',
        params.project,
        params.section
      ].join('/')
    }
  }

  // 
  diggerFolderUI({
    // we extract the item id from this part of the path
    idParam:'id',
    // this is where we want to mount the digger REST server
    mountpoint:opts.url + '/db/:project/:section',
    // the backend digger REST url
    diggerurl:tools.diggerUrl(),
    // a function that wraps each route
    routeWrapper:routeWrapper,
    // a function that returns the route params
    getParams:getParams,
    // a http-hash-router
    router:router
  })

  function handler(req, res) {

    function onError(err) {
      if (err) {
        res.statusCode = err.statusCode || 500;
        res.end(err.message);
      }
    }

    logger(req, res, function (err) {
      if(err) return onError(err)
      router(req, res, {}, onError)
    })
  }

  return handler
}
```
