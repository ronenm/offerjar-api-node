var Connector = require('./connector.js');

function Store(parent,token) {
  Connector.call(this,parent,token);
}

var proto = Store.prototype = Object.create(Connector.prototype);
proto.constructor = Store;

module.exports = Store;

proto.connect = function(uid,callback) {
  this.uid = uid;
  return this.load(callback);
}

// rec is optional
proto.load = function(rec,callback) {
  if (typeof(rec) == 'object') {
    this.store_rec = rec;
    callback.call(this.undefined,undefined,rec);
    return rec;
  } else {
    if (typeof(rec) == 'function') {
      callback = rec;
    }
    var self = this;

    return this.get(undefined,function (error, response, body) {
      if (response.statusCode == 200){
        self.store_rec = body;
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
    if (!body.store || !body.store.uid) {
      if (body.error) {
        callback.call(this,body.error,response,body);
      } else {
        callback.call(this,error || 'Unable to create store',response,body);
      }
    } else {
      self.store_rec = body;
      self.uid = body.store.uid;
      callback.call(this,error,response,body);
    }
  });
}


//##################################################################################
// token: Change store token (use if token compromised)
//
// Hashed Parameters: (pass to the add_params hash)
//    new_token (Required,String): The new token (obtained through the oauth system)
//
//##################################################################################
    Store.prototype.token = function(add_params, callback) {
      var params = {
         uid: this.uid
      }
      return this.api_call('/stores/:uid/token', 'post', params, add_params,callback);
    }

//##################################################################################
// update: Update the store
//
// Hashed Parameters: (pass to the add_params hash)
//    name (Optional,String): The name of the store
//    default_category_id (Optional,Integer): The global default category of the store
//    store_url (Optional,String): The store url
//    success_uri (Optional,String): The success uri of the store (can be relative to store url or full url)
//    cancel_uri (Optional,String): The cancel uri of the store (can be relative to store url or full url)
//    currency (Optional,String): The default currency of the store
//    locale (Optional,String): The locale keyword of the store
//    logo_uri (Optional,String): The uri/url for the store logo. Use empty string to erase the logo.
//
//##################################################################################
    Store.prototype.update = function(add_params, callback) {
      var params = {
         uid: this.uid
      }
      return this.api_call('/stores/:uid', 'put', params, add_params,callback);
    }

//##################################################################################
// get: 
//
//##################################################################################
    Store.prototype.get = function(add_params, callback) {
      var params = {
         uid: this.uid
      }
      return this.api_call('/stores/:uid', 'get', params, add_params,callback);
    }

//##################################################################################
// get_taxonomies: Get taxonomies of the store
//
// Hashed Parameters: (pass to the add_params hash)
//    search (Optional,String): Put part of the taxonomy name and all matching taxonomies will be returned
//
//##################################################################################
    Store.prototype.get_taxonomies = function(add_params, callback) {
      var params = {
         uid: this.uid
      }
      return this.api_call('/stores/:uid/taxonomies', 'get', params, add_params,callback);
    }

//##################################################################################
// get_taxonomy: Get the taxonomy
//
// Parameters:
//    rid (String): A valid taxonomy id (as defined in the remote store)
//
//##################################################################################
    Store.prototype.get_taxonomy = function(rid, add_params, callback) {
      var params = {
         uid: this.uid,      rid: rid
      }
      return this.api_call('/stores/:uid/taxonomies/:rid', 'get', params, add_params,callback);
    }

//##################################################################################
// create_taxonomy: Set the taxonomy
//
// Parameters:
//    rid (String): A valid taxonomy id (as defined in the remote store)
//
// Hashed Parameters: (pass to the add_params hash)
//    name (Required,String): The name of the taxonomy
//    parent_rid (Optional,String): The parent rid
//    sons_rids (Optional,String): A commam seperated list of the sons rids
//    category_id (Optional,Integer): The global category id linked to the taxonomy
//
//##################################################################################
    Store.prototype.create_taxonomy = function(rid, add_params, callback) {
      var params = {
         uid: this.uid,      rid: rid
      }
      return this.api_call('/stores/:uid/taxonomies/:rid', 'post', params, add_params,callback);
    }

//##################################################################################
// get_products: Returns list of all products for the store
//
// Hashed Parameters: (pass to the add_params hash)
//    what (Optional,String): What should be retrieved on all product. Available options: "rid" , "burl" (button url,the default), "short" or "long"
//    category_id (Optional,Integer): Get only products that belong to certain global category
//    taxonomy_rid (Optional,String): Get only product that belong to a certain taxonomy
//
//##################################################################################
    Store.prototype.get_products = function(add_params, callback) {
      var params = {
         uid: this.uid
      }
      return this.api_call('/stores/:uid/products', 'get', params, add_params,callback);
    }

//##################################################################################
// create_product: Create a new product
//
// Hashed Parameters: (pass to the add_params hash)
//    rid (Required,String): The remote store id of the product (must be unique)
//    title (Required,String): A short title for the procduct
//    description (Required,String): The description of the product
//    offer (Required,String): The initial offer
//    minimum_price (Optional,String): The minimum price that accepts for the product
//    category_id (Optional,Integer): The category id that the product belongs to (global ink categories)
//    taxonomies_rids (Optional,String): The taxonomies of the product (optional)
//    sku (Optional,String): The sku (or any other seller's internal identification number). Must be unique!
//    images_urls (Optional,Array): List of image urls to add to the gallery (it will download the images from the urls)
//    allow_override (Optional,Virtus::Attribute::Boolean): Wheather to allow overriding of existing product
//    info (Optional,Hash): Adds additional info for the product record (actually the remote_shop_id record)
//
//##################################################################################
    Store.prototype.create_product = function(add_params, callback) {
      var params = {
         uid: this.uid
      }
      return this.api_call('/stores/:uid/products', 'post', params, add_params,callback);
    }

//##################################################################################
// get_product: Get the product's details
//
// Parameters:
//    rid (String): A valid product id
//
// Hashed Parameters: (pass to the add_params hash)
//    what (Optional,String): What should be retrieved on all product. Available options: "burl" (button url, default), "short" or "long"
//
//##################################################################################
    Store.prototype.get_product = function(rid, add_params, callback) {
      var params = {
         uid: this.uid,      rid: rid
      }
      return this.api_call('/stores/:uid/products/:rid', 'get', params, add_params,callback);
    }

//##################################################################################
// update_product: Update product
//
// Parameters:
//    rid (String): A valid product id
//
// Hashed Parameters: (pass to the add_params hash)
//    title (Optional,String): A short title for the procduct
//    description (Optional,String): The description of the product
//    offer (Optional,String): The initial offer
//    minimum_price (Optional,String): The minimum price that accepts for the product
//    category_id (Optional,Integer): The category id that the product belongs to (global ink categories)
//    taxonomies_rids (Optional,String): The taxonomies of the product (optional)
//    sku (Optional,String): The sku (or any other seller's internal identification number). Must be unique!
//    images_urls (Optional,Array): List of image urls to add to the gallery (it will download the images from the urls)
//    allow_override (Optional,Virtus::Attribute::Boolean): Wheather to allow overriding of existing product
//    info (Optional,Hash): Adds additional info for the product record (actually the remote_shop_id record)
//
//##################################################################################
    Store.prototype.update_product = function(rid, add_params, callback) {
      var params = {
         uid: this.uid,      rid: rid
      }
      return this.api_call('/stores/:uid/products/:rid', 'put', params, add_params,callback);
    }

//##################################################################################
// get_product_images: Get list of all images
//
// Parameters:
//    rid (String): A valid product id
//
//##################################################################################
    Store.prototype.get_product_images = function(rid, add_params, callback) {
      var params = {
         uid: this.uid,      rid: rid
      }
      return this.api_call('/stores/:uid/products/:rid/images', 'get', params, add_params,callback);
    }

//##################################################################################
// upload_product_image: Upload an image
//
// Parameters:
//    rid (String): A valid product id
//    file_name (String): The file name to upload from (in the local file system)
//
// Hashed Parameters: (pass to the add_params hash)
//    title (Optional,String): The title of the image
//
//##################################################################################
    //Store.prototype.upload_product_image = function(rid, add_params, callback) {
    //  p_name = File.basename(file_name)
    //  fh = File.open(file_name,'r')
    //  var file = {
    //     filename: this.p_name,        :content => Base64.encode64(fh.read)
    //  }
    //  var params = {
    //     uid: this.uid,      rid: rid
    //  }
    //  add_params[:file] = file
    //  add_params[:send_xml] = true
    //  return this.api_call('/stores/:uid/products/:rid/images/upload', 'post', params, add_params,callback);
    //}

//##################################################################################
// upload_url_product_image: Upload image (from url to ink)
//
// Parameters:
//    rid (String): A valid product id
//
// Hashed Parameters: (pass to the add_params hash)
//    url (Required,String): The url to upload the image from
//    title (Optional,String): The title of the image
//
//##################################################################################
    Store.prototype.upload_url_product_image = function(rid, add_params, callback) {
      var params = {
         uid: this.uid,      rid: rid
      }
      return this.api_call('/stores/:uid/products/:rid/images/upload_url', 'post', params, add_params,callback);
    }

//##################################################################################
// get_product_image: Get an image url (to be used to show the image)
//
// Parameters:
//    rid (String): A valid product id
//    id (Integer): The idenfitier of the photo
//    style (): The style of the image
//
//##################################################################################
    Store.prototype.get_product_image = function(rid, id, style, add_params, callback) {
      var params = {
         uid: this.uid,      rid: rid,      id: id,      style: style
      }
      return this.api_call('/stores/:uid/products/:rid/images/:id/:style', 'get', params, add_params,callback);
    }

//##################################################################################
// delete_product_image: Delete an image
//
// Parameters:
//    rid (String): A valid product id
//    id (Integer): Tre identifier of the photo
//
//##################################################################################
    Store.prototype.delete_product_image = function(rid, id, add_params, callback) {
      var params = {
         uid: this.uid,      rid: rid,      id: id
      }
      return this.api_call('/stores/:uid/products/:rid/images/:id', 'delete', params, add_params,callback);
    }

//##################################################################################
// reorder_product_image: Reorder images
//
// Parameters:
//    rid (String): A valid product id
//
// Hashed Parameters: (pass to the add_params hash)
//    order (Required,): 
//
//##################################################################################
    Store.prototype.reorder_product_image = function(rid, add_params, callback) {
      var params = {
         uid: this.uid,      rid: rid
      }
      return this.api_call('/stores/:uid/products/:rid/images/reorder', 'post', params, add_params,callback);
    }

//##################################################################################
// get_button_product: Get the button's product
//
// Parameters:
//    buid (String): The button uid
//
// Hashed Parameters: (pass to the add_params hash)
//    what (Optional,String): What should be retrieved on all product. Available options: "rid" just the pids, "short" (the default) or "long"
//
//##################################################################################
    Store.prototype.get_button_product = function(buid, add_params, callback) {
      var params = {
         uid: this.uid,      buid: buid
      }
      return this.api_call('/stores/:uid/buttons/:buid/product', 'get', params, add_params,callback);
    }

//##################################################################################
// get_button_cans: Get all negotiations for a button (with state)
//
// Parameters:
//    buid (String): The button uid
//
// Hashed Parameters: (pass to the add_params hash)
//    state (Optional,String): Filter by state of negotiation
//
//##################################################################################
    Store.prototype.get_button_cans = function(buid, add_params, callback) {
      var params = {
         uid: this.uid,      buid: buid
      }
      return this.api_call('/stores/:uid/buttons/:buid/cans', 'get', params, add_params,callback);
    }

//##################################################################################
// get_button_can: Get a negotiation information (may depend on the state of the negotiation)
//
// Parameters:
//    buid (String): The button uid
//    nuid (String): The negotiation uid
//
//##################################################################################
    Store.prototype.get_button_can = function(buid, nuid, add_params, callback) {
      var params = {
         uid: this.uid,      buid: buid,      nuid: nuid
      }
      return this.api_call('/stores/:uid/buttons/:buid/cans/:nuid', 'get', params, add_params,callback);
    }

//##################################################################################
// close_button_can: Close a negotiation (mark it as completed)
//
// Parameters:
//    buid (String): The button uid
//    nuid (String): The negotiation uid
//
//##################################################################################
    Store.prototype.close_button_can = function(buid, nuid, add_params, callback) {
      var params = {
         uid: this.uid,      buid: buid,      nuid: nuid
      }
      return this.api_call('/stores/:uid/buttons/:buid/cans/:nuid/close', 'post', params, add_params,callback);
    }

//##################################################################################
// create: Create a store
//
// Hashed Parameters: (pass to the add_params hash)
//    name (Required,String): The name of the store
//    default_category_id (Required,Integer): The global default category of the store
//    store_url (Required,String): The store url
//    checkout_title (Optional,String): The title to put on the link to the succesful negotiation (defaults to 'Checkout')
//    success_uri (Required,String): The success uri of the store (can be relative to store url or full url)
//    cancel_uri (Required,String): The cancel uri of the store (can be relative to store url or full url)
//    currency (Required,String): The default currency of the store
//    locale (Required,String): The locale keyword of the store
//    logo_uri (Optional,String): The uri/url for the store logo. Use empty string to erase the logo.
//
//##################################################################################
    Store.prototype.create = function(add_params, callback) {
      var params = {
      }
      return this.api_call('/stores', 'post', params, add_params,callback);
    }

//##################################################################################
// upload_product_image: Upload an image
//
// Parameters:
//    rid (String): A valid product id
//    file_name (String): The file name to upload from (in the local file system)
//
// Hashed Parameters: (pass to the add_params hash)
//    title (Optional,String): The title of the image
//
//##################################################################################
Store.prototype.upload_product_image = function(rid, file_name, add_params, callback) {
  var splitted_path = file_name.split("/")
  var p_name = splitted_path.pop();
  var this_obj = this;
  var params = {
     uid: this.uid,
     rid: rid
  }
  fs.readFile(file_name,{ encoding: 'base64'}, function(err,data) {
    if (err) throw err;
    add_params.file = {
      filename: p_name,
      content: data
    }
    add_params.send_xml = true;
    this_obj.api_call('/stores/:uid/products/:rid/images/upload', 'post', params, add_params,callback);
  });
}


