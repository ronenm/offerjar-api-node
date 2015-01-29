var Connector = require('./connector.js');

function ConversationProxy(parent,token) {
  Connector.call(this,parent,token);
}

var proto = ConversationProxy.prototype = Object.create(Connector.prototype);

proto.constructor = ConversationProxy;

module.exports = ConversationProxy;

proto.connect = function(uid,callback) {
  this.uid = uid;
  this.load(callback);
}

// rec is optional
proto.load = function(rec,callback) {
  if (typeof(rec) == 'object') {
    this.conversation_proxy_rec = rec;
    callback.call(this.false,undefined,rec);
    return rec;
  } else {
    if (typeof(rec) == 'function') {
      callback = rec;
    }
    var self = this;
    return this.get(undefined,function (error, response, body) {
      if (response.statusCode == 200){
        self.conversation_proxy_rec = body;
      } else {
        console.log('error: '+ response.statusCode)
        console.log(body)
      }
      callback.call(this,error,response,body);
    });
  }
}

proto.create_by_client_id = function(client_id,client_secret,add_params,callback) {
  var self = this;
  return this.parent.generateToken(client_id,client_secret,function(error, response, body) {
    token_rec = body.token;
    if (token_rec.error) {
      callback.call(this,token_rec.error,response,body);
    } else if (!token_rec.access_token) {
      callback.call(this,error || 'Missing token',response,body);
    } else {
      self.create_by_token(token_rec.access_token,add_params,callback);
    }
  });
}

proto.create_by_token = function(token,add_params,callback) {
  var self = this;
  return this.create(add_params,function(error,response,body) {
    if (!body.conversation_proxy || !body.conversation_proxy.uid) {
      if (body.error) {
        callback.call(this,body.error,response,body);
      } else {
        callback.call(this,error || 'Unable to create Conversation proxy',response,body);
      }
    } else {
      self.conversation_proxy_rec = body;
      self.uid = body.conversation_proxy.uid;
      callback.call(this,error,response,body);
    }
  });
}


//##################################################################################
// update: Update the conversation proxy
//
// Hashed Parameters: (pass to the add_params hash)
//    name (Optional,String): The name of the conversation proxy
//    notification_mode (Optional,String): The notification mode that will be used by the app. When using push notification, poll is also allowed.
//    webhook (Optional,String): The webhook url (must be given when notification_mode is 'push'
//    logo_uri (Optional,String): The uri/url for the the app logo. Use empty string to erase the logo.
//
//##################################################################################
    ConversationProxy.prototype.update = function(add_params, callback) {
      var params = {
         uid: this.uid
      }
      return this.api_call('/conversation_proxies/:uid', 'put', params, add_params,callback);
    }

//##################################################################################
// get: 
//
//##################################################################################
    ConversationProxy.prototype.get = function(add_params, callback) {
      var params = {
         uid: this.uid
      }
      return this.api_call('/conversation_proxies/:uid', 'get', params, add_params,callback);
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
    ConversationProxy.prototype.create_affinity = function(add_params, callback) {
      var params = {
         uid: this.uid
      }
      return this.api_call('/conversation_proxies/:uid/affinities', 'post', params, add_params,callback);
    }

//##################################################################################
// delete_affinity: Cancel an affinity
//
// Parameters:
//    user_affinity_token (String): The user affinity token of the user that is going to cancel
//
//##################################################################################
    ConversationProxy.prototype.delete_affinity = function(user_affinity_token, add_params, callback) {
      var params = {
         uid: this.uid,      user_affinity_token: user_affinity_token
      }
      return this.api_call('/conversation_proxies/:uid/affinities/:user_affinity_token', 'delete', params, add_params,callback);
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
    ConversationProxy.prototype.expose_affinity = function(user_affinity_token, add_params, callback) {
      var params = {
         uid: this.uid,      user_affinity_token: user_affinity_token
      }
      return this.api_call('/conversation_proxies/:uid/affinities/:user_affinity_token/expose', 'post', params, add_params,callback);
    }

//##################################################################################
// get_affinity_session: Get a user session for usage of other applications. Session is valid for 10 minutes!
//
// Parameters:
//    user_affinity_token (String): The user affinity token of the user that is going to cancel
//
//##################################################################################
    ConversationProxy.prototype.get_affinity_session = function(user_affinity_token, add_params, callback) {
      var params = {
         uid: this.uid,      user_affinity_token: user_affinity_token
      }
      return this.api_call('/conversation_proxies/:uid/affinities/:user_affinity_token/session', 'get', params, add_params,callback);
    }

//##################################################################################
// initiate_negotiation: Initiate a buyer negotiation
//
// Hashed Parameters: (pass to the add_params hash)
//    user_affinity_token (Required,String): The user affinity token of the user that is going to initiate the negotiation
//    buid (Required,String): The button unique id for the product that is being negotiated for
//    initial_bid (Optional,String): The initial bid that is offered to the seller
//    image_style (Optional,String): Set this option to get the url of the images of certain style or all styles.
//                                   Use '*' or 'all' for all styles.
//
//##################################################################################
    ConversationProxy.prototype.initiate_negotiation = function(add_params, callback) {
      var params = {
         uid: this.uid
      }
      return this.api_call('/conversation_proxies/:uid/negotiations/initiate', 'post', params, add_params,callback);
    }

//##################################################################################
// get_negotiations: Get all negotiations
//
// Hashed Parameters: (pass to the add_params hash)
//    all (Optional,Virtus::Attribute::Boolean): Take both active and non active negotiations!
//    image_style (Optional,String): Set this option to get the url of the images of certain style or all styles.
//                                   Use '*' or 'all' for all styles.
//
//##################################################################################
    ConversationProxy.prototype.get_negotiations = function(add_params, callback) {
      var params = {
         uid: this.uid
      }
      return this.api_call('/conversation_proxies/:uid/negotiations', 'get', params, add_params,callback);
    }

//##################################################################################
// get_negotiation: Get the current negotiation status
//
// Parameters:
//    nuid (String): The negotiation id
//
// Hashed Parameters: (pass to the add_params hash)
//    image_style (Optional,String): Set this option to get the url of the images of certain style or all styles.
//                                   Use '*' or 'all' for all styles.
//
//##################################################################################
    ConversationProxy.prototype.get_negotiation = function(nuid, add_params, callback) {
      var params = {
         uid: this.uid,      nuid: nuid
      }
      return this.api_call('/conversation_proxies/:uid/negotiations/:nuid', 'get', params, add_params,callback);
    }

//##################################################################################
// get_negotiation_poll: Poll messages for the current negotiation
//
// Parameters:
//    nuid (String): The negotiation id
//
// Hashed Parameters: (pass to the add_params hash)
//    kind (Optional,String): The kind of negotiation (sell or buy), buy is the default
//    last_id (Optional,Integer): The id of the last message that was polled. If not set, it will use the internall stored last_id
//
//##################################################################################
    ConversationProxy.prototype.get_negotiation_poll = function(nuid, add_params, callback) {
      var params = {
         uid: this.uid,      nuid: nuid
      }
      return this.api_call('/conversation_proxies/:uid/negotiations/:nuid/poll', 'get', params, add_params,callback);
    }

//##################################################################################
// do_negotiation: Perform a transition on the negotiation (ex: bid, accept, checkout etc...)
//
// Parameters:
//    nuid (String): The negotiation id
//    transition (String): The transition to perform. Must be one of the transitions that are available.
//
// Hashed Parameters: (pass to the add_params hash)
//    bid (Optional,String): The bid to perform (required for some of the transitions)
//    image_style (Optional,String): Set this option to get the url of the images of certain style or all styles.
//                                   Use '*' or 'all' for all styles.
//
//##################################################################################
    ConversationProxy.prototype.do_negotiation = function(nuid, transition, add_params, callback) {
      var params = {
         uid: this.uid,      nuid: nuid,      transition: transition
      }
      return this.api_call('/conversation_proxies/:uid/negotiations/:nuid/:transition', 'put', params, add_params,callback);
    }

//##################################################################################
// create: Create a conversation proxy
//
// Hashed Parameters: (pass to the add_params hash)
//    name (Required,String): A name for the proxy
//    notification_mode (Optional,String): The notification mode that will be used by the app. When using push notification, poll is also allowed.
//    webhook (Optional,String): The webhook url (must be given when notification_mode is 'push'
//    logo_uri (Optional,String): The uri/url for the the app logo. Use empty string to erase the logo.
//
//##################################################################################
    ConversationProxy.prototype.create = function(add_params, callback) {
      var params = {
      }
      return this.api_call('/conversation_proxies', 'post', params, add_params,callback);
    }

