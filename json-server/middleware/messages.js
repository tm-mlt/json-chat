module.exports = (req, res, next) => {
  if(req.method === 'POST' && req.path === '/messages/') {
    req.body.createdAt = +new Date();
    next();
  } else {
    next();
  }
}
