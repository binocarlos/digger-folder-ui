# digger-folder-ui

REST API bridge server between [folder-ui](https://github.com/binocarlos/folder-ui) clients and [digger-rest](https://github.com/binocarlos/digger-rest) backends

## install

```bash
$ npm install digger-folder-ui --save
$ yarn add digger-folder-ui
```

## usage

```javascript

var diggerFolderUI = require('digger-folder-ui')

var folderRoutes = diggerFolderUI({
  // the url of the backend digger server
  url:'http://1.2.3.4:8888'
})


var router = HttpHashRouter()
router.set('/products/tree', {
  GET:folderRoutes.tree
})
```
