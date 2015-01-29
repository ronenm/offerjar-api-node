var request = require('request');
var queryString = require('query-string');

var SITES = {
  test: 'http://new-host:3001/',
  production: 'https://app.inkomerce.com/',

}

var UI_SITES = {
  test: 'http://new-host:3002/',
  production: 'https://ui.offerjar.com/'
}


function OfferJar(site_type) {
  //var auth = new Buffer(board + ':' + pwd).toString('base64');

  this.site_type = site_type || 'production';
}

var proto = OfferJar.prototype;
  
proto.apiUrl = function() {
  return SITES[this.site_type];
}

proto.uiUrl = function(action,params) {
  var url = UI_SITES[this.site_type] + action;
  if (typeof(params) == 'object') {
    var query = queryString.stringify(params);
    return url + '?' + query;
  } else {
    return url;
  }
}
  
proto.generateToken = function(client_id,client_secret,callback) {
  var query = queryString.stringify({
    client_id: client_id,
    client_secret: client_secret,
    grant_type: 'client_credentials'
  });
  var url = this.apiUrl() + 'oauth/token?' + query;
  return request.get({
    uri: url,
    json: true
  },callback);
}
  
var sources = {
  Global: './global.js',
  ConversationProxy: './conversation_proxy.js',
  Store: './store.js',
  PartnerProxy: './partner_proxy.js'
}

module.exports = new OfferJar();
  
var cls_name;
for (cls_name in sources) {
  var orig_cls = require(sources[cls_name]);
  var cls = function(token) {
    orig_cls.call(this,module.exports,token);
  }
  cls.prototype = Object.create(orig_cls.prototype);
  cls.prototype.constructor = cls;
  module.exports[cls_name] = cls;
}



