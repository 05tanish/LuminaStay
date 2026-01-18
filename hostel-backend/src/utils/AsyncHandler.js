export  const aysnchandler = (fn)=>{
return (res,req,next)=>{
    Promise.resolve(fn(req, res, next)).catch(next)
}
}