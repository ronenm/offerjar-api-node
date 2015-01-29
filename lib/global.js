var Connector = require('./connector.js');

function Global(parent,token) {
  Connector.call(this,parent,token);
}

Global.prototype = Object.create(Connector.prototype);
Global.prototype.constructor = Global;

module.exports = Global;


//##################################################################################
// get_categories: Returns list of all categories
//
// Hashed Parameters: (pass to the add_params hash)
//    search (Optional,String): Put part of the category name and all matching categories will be returned
//
//##################################################################################
    Global.prototype.get_categories = function(add_params, callback) {
      var params = {
      }
      return this.api_call('/global/categories', 'get', params, add_params,callback);
    }

//##################################################################################
// get_currencies: Get list of all currnecies supported by InKomerce
//
// Hashed Parameters: (pass to the add_params hash)
//    country (Optional,String): Put part of the country name and all matching currencies will be returned
//    country_code (Optional,String): Find currency by country code (two letters)
//
// Note: country and country_code are mutual exclusive (cannot be used together)
//##################################################################################
    Global.prototype.get_currencies = function(add_params, callback) {
      var params = {
      }
      return this.api_call('/global/currencies', 'get', params, add_params,callback);
    }

//##################################################################################
// get_image_url: Get an image url
//
// Parameters:
//    id (Integer): The image id to get the urls for
//
// Hashed Parameters: (pass to the add_params hash)
//    style (Optional,String): The style of the image. Use '*' or 'all' for all images (or just don't set)
//
//##################################################################################
    Global.prototype.get_image_url = function(id, add_params, callback) {
      var params = {
         id: id
      }
      return this.api_call('/global/images/:id/url', 'get', params, add_params,callback);
    }

//##################################################################################
// get_button: Get the data related to a button
//
// Parameters:
//    buid (String): The button uid
//
// Hashed Parameters: (pass to the add_params hash)
//    image_style (Optional,String): Set this option to get the url of the images of certain style or all styles.
//                                   Use '*' or 'all' for all styles.
//
//##################################################################################
    Global.prototype.get_button = function(buid, add_params, callback) {
      var params = {
         buid: buid
      }
      return this.api_call('/global/buttons/:buid', 'get', params, add_params,callback);
    }

