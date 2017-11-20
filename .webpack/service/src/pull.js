(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = __webpack_require__(1);

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = __webpack_require__(2);

var _promise2 = _interopRequireDefault(_promise);

exports.pull = pull;

var _awsSdk = __webpack_require__(3);

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _uuid = __webpack_require__(4);

var _uuid2 = _interopRequireDefault(_uuid);

var _nodeFetch = __webpack_require__(5);

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var apiKey = '4BTXXNOJRXYRNEOD';
var API_URL = 'https://www.alphavantage.co/query';

var dynamoDb = new _awsSdk2.default.DynamoDB.DocumentClient();

function handleError(callback) {
  console.error('Validation Failed');
  callback(null, {
    statusCode: 400,
    headers: { 'Content-Type': 'text/plain' },
    body: "Couldn't fetch the stock list"
  });
}

var params = {
  TableName: process.env.DYNAMODB_TABLE
};

function fetchStockData(stockSymbol, functionType) {
  var type = functionType || 'TIME_SERIES_DAILY';

  return (0, _nodeFetch2.default)(API_URL + '?function=' + type + '&symbol=' + stockSymbol + '&apikey=' + apiKey).then(function (response) {
    if (response.ok) {
      return response;
    }
    return _promise2.default.reject(new Error('fail to fetch stock info.'));
  }).then(function (response) {
    return response.json();
  });
}

function pull(event, context, callback) {
  var message = JSON.parse(event.Records[0].Sns.Message);
  var stockName = message.name;
  var stockSymbol = message.symbol;
  var timestamp = new Date().getTime();

  fetchStockData(stockSymbol).then(function (resp) {
    var closed_value = {};

    for (var key in resp['Time Series (Daily)']) {
      closed_value[key] = resp['Time Series (Daily)'][key]['4. close'];
    }

    var params = {
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        id: _uuid2.default.v1(),
        stock_name: stockName,
        stock_symbol: stockSymbol,
        closed_value: closed_value,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    };

    dynamoDb.put(params, function (error) {
      if (error) {
        handleError(callback);
        return;
      }

      var response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
        },
        body: (0, _stringify2.default)(params.Item)
      };
      callback(null, response);
    });
  });
}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/json/stringify");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/promise");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("uuid");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("node-fetch");

/***/ })
/******/ ])));