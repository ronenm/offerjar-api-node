var Connector = require('./connector.js');

function PartnerProxy(parent,token) {
  Connector.call(this,parent,token);
}

var proto = PartnerProxy.prototype = Object.create(Connector.prototype);
proto.constructor = PartnerProxy;

module.exports = PartnerProxy;

proto.connect = function(uid,callback) {
  this.uid = uid;
  return this.load(callback);
}

// rec is optional
proto.load = function(rec,callback) {
  if (typeof(rec) == 'object') {
    this.partner_record = rec;
    callback.call(this.false,undefined,rec);
    return rec;
  } else {
    var self = this;
    if (typeof(rec) == 'function') {
      callback = rec;
    }
    return this.get(undefined,function (error, response, body) {
      if (response.statusCode == 200){
        self.partner_record = body;
      } else {
        console.log('error: '+ response.statusCode)
        console.log(body)
      }
      callback.call(this,error,response,body);
    });
  }
}

proto.authenticate_me = function(uid,client_id,client_secret,add_params,callback) {
  var self = this;
  return this.parent.generateToken(client_id,client_secret,function(error, response, body) {
    token_rec = body.token;
    if (token_rec.error) {
      callback.call(this,token_rec.error,response,body);
    } else if (!token_rec.access_token) {
      callback.call(this,error || "Missing token",response,body);
    } else {
      self.uid = uid;
      self.authenticate(add_params,function(error,response, body) {
        if (!body.partner) {
          if (body.error) {
            callback.call(this,body.error,response,body);
          } else {
            callback.call(this,error || 'Unable to authenticate Partner proxy',response,body);
          }
        } else {
          self.partner_record = body;
          callback.call(this,error,response,body);
        }
      });
    }
    
  });
}


//##################################################################################
// get: Get your partner account's details
//
//##################################################################################
    PartnerProxy.prototype.get = function(add_params, callback) {
      var params = {
         uid: this.uid
      }
      return this.api_call('/partner_proxies/:uid', 'get', params, add_params,callback);
    }

//##################################################################################
// create_affinity: Create or get a user affiliation
//
// Hashed Parameters: (pass to the add_params hash)
//    token (Optional,String): A token number for a user that was provided by InKomerce user authentication system
//    email_address (Optional,String): An email address that can be used to identify the user
//    name (Optional,String): Used to add a descriptive user name when it does not exists (relevant only to email_address)
//
//##################################################################################
    PartnerProxy.prototype.create_affinity = function(add_params, callback) {
      var params = {
         uid: this.uid
      }
      return this.api_call('/partner_proxies/:uid/affinities', 'post', params, add_params,callback);
    }

//##################################################################################
// delete_affinity: Cancel an affinity
//
// Parameters:
//    user_affinity_token (String): The user affinity token of the user that is going to cancel
//
//##################################################################################
    PartnerProxy.prototype.delete_affinity = function(user_affinity_token, add_params, callback) {
      var params = {
         uid: this.uid,      user_affinity_token: user_affinity_token
      }
      return this.api_call('/partner_proxies/:uid/affinities/:user_affinity_token', 'delete', params, add_params,callback);
    }

//##################################################################################
// expose_affinity: Expose an affinity (works only on anonymous affinities)
//
// Parameters:
//    user_affinity_token (String): The user affinity token of the user that is going to cancel
//
// Hashed Parameters: (pass to the add_params hash)
//    token (Optional,String): A token number for a user that was provided by InKomerce user authentication system
//    email_address (Optional,String): An email address that can be used to identify the user
//    name (Optional,String): Used to add a descriptive user name when it does not exists (relevant only to email_address)
//
//##################################################################################
    PartnerProxy.prototype.expose_affinity = function(user_affinity_token, add_params, callback) {
      var params = {
         uid: this.uid,      user_affinity_token: user_affinity_token
      }
      return this.api_call('/partner_proxies/:uid/affinities/:user_affinity_token/expose', 'post', params, add_params,callback);
    }

//##################################################################################
// get_affinity_session: Get a user session for usage of other applications. Session is valid for 10 minutes!
//
// Parameters:
//    user_affinity_token (String): The user affinity token of the user that is going to cancel
//
//##################################################################################
    PartnerProxy.prototype.get_affinity_session = function(user_affinity_token, add_params, callback) {
      var params = {
         uid: this.uid,      user_affinity_token: user_affinity_token
      }
      return this.api_call('/partner_proxies/:uid/affinities/:user_affinity_token/session', 'get', params, add_params,callback);
    }

//##################################################################################
// authenticate: Authenticate your partner account
//
//##################################################################################
    PartnerProxy.prototype.authenticate = function(add_params, callback) {
      var params = {
         uid: this.uid
      }
      return this.api_call('/partner_proxies/:uid/authenticate', 'post', params, add_params,callback);
    }

