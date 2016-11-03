function errorWrapper(res, fn){
  return function(err, data){
    if(err){
      res.statusCode = 500
      res.end(err.toString())
      return
    }
    fn(data)
  }
}

module.exports = {
  errorWrapper:errorWrapper
}