var concat = require('concat-stream')

function errorWrapper(res, fn, errorCode){
  errorCode = errorCode || 500
  return function(err, data){
    if(err){
      res.statusCode = errorCode
      res.end(err.toString())
      return
    }
    fn(data)
  }
}

function jsonRequestWrapper(req, res, done){
  req.pipe(concat(function(data){
    try{
      data = JSON.parse(data.toString())
    } catch(err) {
      res.statusCode = 500
      res.end(err.toString())
      return
    }
    done(data)
  }))
}

function jsonResponseWrapper(res, opts){
  opts = opts || {}
  return errorWrapper(res, function(data){
    data = opts.filter ? opts.filter(data) : data
    res.setHeader('Content-type', 'application/json')
    res.end(JSON.stringify(data))  
  }, opts.code)
}

module.exports = {
  errorWrapper:errorWrapper,
  jsonRequestWrapper:jsonRequestWrapper,
  jsonResponseWrapper:jsonResponseWrapper 
}