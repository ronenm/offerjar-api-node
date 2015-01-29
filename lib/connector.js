// The connector base class!
var request = require('request');
var queryString = require('query-string');

// Parent should have an apiUrl method!
function Connector(parent,token) {
  this.parent = parent;
  this.token = token;
}

module.exports = Connector;

Connector.prototype.apiCallUrl = function(call) {
  return this.parent.apiUrl() + 'api/v1' + call
}

// Method call can be called with the following possibilities:
//   connector.raw_call("call",callback)  (uses get)
//   connector.raw_call("call",{params},callback)  (still uses get)
//   connector.raw_call("call","method",callback (uses method "method"))
//   connector.raw_call("call","method",{params},callback (uses method "method"))
Connector.prototype.raw_call = function(call,method,params,callback) {
  // Use a "waterfall" style programming
  if (typeof(method) != 'string') {
    callback = params;
    params = method;
    method = 'get'; 
  }
  if (typeof(params) == 'function') {
    callback = params;
    params = undefined;
  }
  
  var req_options = {
    uri: this.apiCallUrl(call),
    method: method,
    json: true,
    headers: {
      'User-Agent': 'InKomerce API Ruby SDK'
    }
    
  }
  
  if (this.token) {
    //req_options.auth = { bearer: "token=" + this.token }
    req_options.headers['Authorization'] = "Bearer token=" + this.token;
  }
  
  if (typeof(params)=='object') {
    if ((method=='get')||(method=='delete')) {
      req_options.url += '?' + queryString.stringify(params);
    } else {
      // It should be either put, post and patch
      req_options.body = params;
    }
  }
  console.log("Request:"); console.info(req_options);
  return request(req_options,callback);
  
}

// Similarly you can ommit the method here, however you can't ommit params if you
// would like to use add_params (use empty hash instead!)
Connector.prototype.api_call = function(path,method,params,add_params,callback) {
  // Use a "waterfall" style programming
  if (typeof(method) != 'string') {
    callback = add_params;
    add_params = params;
    params = method;
    method = 'get'; 
  }
  if (typeof(params) == 'function') {
    callback = params;
    params = undefined;
    add_params = undefined;
  }
  if (typeof(add_params) == 'function') {
    callback = add_params;
    add_params = undefined;
  }
  
  if (typeof(params)=='object') {
    for (p in params) {
      path = path.replace(eval("/:" + p + '(?=\\/|$)/'),params[p])
    }
  }
  
  if (typeof(add_params)=='object') {
    for (p in params) {
      path = path.replace(eval("/:" + p + '(?=\\/|$)/'),add_params[p])
    }
  }
  
  return this.raw_call(path,method,add_params,callback);
  
}



