'use strict';

angular.module('RestedApp')
.factory('Request', ['RequestUtils',
function(RequestUtils) {

  /**
  * Prepend http:// if missing from url
  * Make sure to allow https
  */
  var prependHttp = function(url) {
    if(!(/^https?:\/\//.test(url))) {
      url = 'http://' + url;
    }
    return url;
  };

  /**
  * Takes an url in the form of site.com/{{key}} and
  * maps the key up against a variable in the params
  * object. It then returns the complete URL.
  *
  * The function also collapses {{key}} to nothing
  * if key is missing, and removes any double slashes
  * left behind.
  */
  var mapParameters = function(url, params) {
    return url.replace(/\{\{(\w+)\}\}/g, function(match, capture) {
      var param = params ? params[capture] : null;
      return param ? param : '';
    }).replace(/([^:]\/)\/+/g, '$1');
  };

  var createXMLHttpRequest = function(req) {
    var request = new XMLHttpRequest();
    request.open(req.method, req.url);
    request.withCredentials = true;

    if(Array.isArray(req.headers)) {
      req.headers.forEach(function(header) {
        if(header.name) {
          request.setRequestHeader(header.name, header.value);
        }
      });
    }

    return request;
  };

  return {
    run: function(request, parameters, fn) {
      var requestCopy = angular.copy(request);

      // Map URL parameters first to allow protocol in parameter
      var url = mapParameters(requestCopy.url, parameters);

      // Prepend http if not provided
      url = prependHttp(url);

      requestCopy.url = url;
      var req = createXMLHttpRequest(requestCopy);
      req.onloadend = fn.bind(req);

      if (request.useFormData) {
        req.send(RequestUtils.formDataToFormString(request.formData));
      } else {
        req.send(request.data);
      }
    },
    /* For unit tests only */
    _prependHttp: prependHttp,
    _mapParameters: mapParameters,
    _createXMLHttpRequest: createXMLHttpRequest
  };
}]);

