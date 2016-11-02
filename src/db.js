/*

  a folder-ui AJAX database implementation that maps data
  from the REST api (index.js)
  
*/

import Ajax from 'folder-ui/lib/db/ajax'

export default function ajaxdb(opts = {}){

  const loadTree = 
  opts.mapFns = Object.assign({}, opts.mapFns, {

  })

  return Ajax(opts)


  return {
    saveItem:(item, done) => {
      
    },
    addItem:(parent, item, done) => {
      console.log('-------------------------------------------');
      console.log('ajax addItem')
      console.dir(parent)
      console.log(urls.addItem(opts.base, parent ? parent.id : null))
      superagent
        .post(urls.addItem(opts.base, parent ? parent.id : null))
        .send(JSON.stringify(item))
        .set('Accept', 'application/json')
        .end((err, res) => {
          if(res.status<500){
            done && done(res.body)
          }
          else{
            done && done(null, mapFns.addItem ? mapFns.addItem(res.body) : res.body)
          }
        })
    },
    pasteItems:(mode, parent, items, done) => {
      
    },
    deleteItem:(id, done) => {
      
    },
    loadItem:(id, done) => {
      
    },
    loadChildren:(id, done) => {
      
    },
    loadTree:(done) => {
      superagent
        .get(urls.loadTree(opts.base))
        .set('Accept', 'application/json')
        .end((err, res) => {
          if(res.status>=400){
            done && done(res.body)
          }
          else{
            done && done(null, mapFns.loadTree ? mapFns.loadTree(res.body) : res.body)
          }
        })
    }
  }
}