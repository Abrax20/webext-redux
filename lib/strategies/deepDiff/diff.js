"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = diffObjects;

var _constants = require("../constants");

var _arrayDiff = require("./arrayDiff");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var objectConstructor = {}.constructor;

function isObject(o) {
  return _typeof(o) === "object" && o !== null && o.constructor === objectConstructor;
}

function shouldTreatAsValue(oldObj, newObj) {
  var bothAreArrays = Array.isArray(oldObj) && Array.isArray(newObj);
  return !isObject(newObj) && !bothAreArrays || _typeof(newObj) !== _typeof(oldObj);
}

function diffValues(oldObj, newObj, shouldContinue, context) {
  // If it's null, use the current value
  if (oldObj === null) {
    return {
      change: _constants.DIFF_STATUS_UPDATED,
      value: newObj
    };
  } // If it's a non-object, or if the type is changing, or if it's an array,
  // just go with the current value.


  if (shouldTreatAsValue(oldObj, newObj) || !shouldContinue(oldObj, newObj, context)) {
    return {
      change: _constants.DIFF_STATUS_UPDATED,
      value: newObj
    };
  }

  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    return {
      change: _constants.DIFF_STATUS_ARRAY_UPDATED,
      value: (0, _arrayDiff.getPatch)(oldObj, newObj)
    };
  } // If it's an object, compute the differences for each key.


  return {
    change: _constants.DIFF_STATUS_KEYS_UPDATED,
    value: diffObjects(oldObj, newObj, shouldContinue, context)
  };
}
/**
 * Performs a deep diff on two objects, created a nested list of patches. For objects, each key is compared.
 * If keys are not equal by reference, diffing continues on the key's corresponding values in the old and new
 * objects. If keys have been removed, they are recorded as such.
 * Non-object, non-array values that are not equal are recorded as updated values. Arrays are diffed shallowly.
 * The shouldContinue function is called on every potential value comparison with the current and previous objects
 * (at the present state in the tree) and the current path through the tree as an additional `context` parameter.
 * Returning false from this function will treat the current value as an updated value, regardless of whether or
 * not it is actually an object.
 * @param {Object} oldObj The old object
 * @param {Object} newObj The new object
 * @param {Function} shouldContinue Called with oldObj, newObj, and context, which is the current object path
 * Return false to stop diffing and treat everything under the current key as an updated value
 * @param {*} context
 */


function diffObjects(oldObj, newObj) {
  var shouldContinue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {
    return true;
  };
  var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  var difference = []; // For each key in the current state,
  // get the differences in values.

  Object.keys(newObj).forEach(function (key) {
    if (oldObj[key] !== newObj[key]) {
      difference.push(_objectSpread({
        key: key
      }, diffValues(oldObj[key], newObj[key], shouldContinue, context.concat(key))));
    }
  }); // For each key previously present,
  // record its deletion.

  Object.keys(oldObj).forEach(function (key) {
    if (!newObj.hasOwnProperty(key)) {
      difference.push({
        key: key,
        change: _constants.DIFF_STATUS_REMOVED
      });
    }
  });
  return difference;
}