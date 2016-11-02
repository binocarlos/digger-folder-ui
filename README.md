# digger-folder-ui

REST API bridge server between [folder-ui](https://github.com/binocarlos/folder-ui) clients and [digger-rest](https://github.com/binocarlos/digger-rest) backends

## install

```bash
$ npm install digger-folder-ui --save
$ yarn add digger-folder-ui
```

## usage

There is a backend server and frontend folder-ui database library

```javascript
var diggerFolderUI = require('digger-folder-ui')

var folderRoutes = diggerFolderUI({
  // the url of the backend digger server
  url:'http://1.2.3.4:8888'
})


var router = HttpHashRouter()
router.set('/products/tree', {
  GET:function(req, res, opts){
    folderRoutes.loadTree({
      path:'/products'  
    }, function(err, data){
      if(err){
        res.statusCode = 500
        res.end(err.toString())
        return
      }
      res.setHeader('Content-type', 'application/json')
      res.end(JSON.stringify(data))
    }
  }
})
```

And the frontend folder-ui database.

```javascript
var diggerFolderDB = require('digger-folder-ui/lib/db')

import React, { Component, PropTypes } from 'react'
import { Route, IndexRoute } from 'react-router'
import boilerapp from 'boiler-frontend'
import Page from 'boiler-frontend/lib/components/Page'

import FolderReducer from 'folder-ui/lib/reducer'
import BasicTemplate from 'folder-ui/lib/templates/basic'

import DiggerDB from 'digger-folder-ui/lib/db'

import {
  USER_DETAILS,
  TYPES,
  TABLE_FIELDS,
  LIBRARY
} from './schema'

import About from './containers/About'
import Dashboard from './containers/Dashboard'

const ItemRoutes = (auth) => {
  return BasicTemplate({
    types:TYPES,
    tableFields:TABLE_FIELDS,
    library:LIBRARY,
    name:'items',
    path:'items',
    onEnter:auth.user,
    db:DiggerDB({
      base:'/v1/api/db/apples/pears'
    })
  })
}

boilerapp({
  mountElement:document.getElementById('mount'),
  reducers:{
    items:FolderReducer('items')
  },
  dashboard:Dashboard,
  userDetailsSchema:USER_DETAILS,
  getRoutes:(auth) => {
    return (
      <Route>
        <Route component={Page}>
          <Route path="about" component={About} />
        </Route>
        {ItemRoutes(auth)}
      </Route>
    )
  }
})
```
