"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DIFF_STATUS_UPDATED = exports.DIFF_STATUS_REMOVED = exports.DIFF_STATUS_KEYS_UPDATED = exports.DIFF_STATUS_ARRAY_UPDATED = void 0;
// The `change` value for updated or inserted fields resulting from shallow diff
var DIFF_STATUS_UPDATED = 'updated'; // The `change` value for removed fields resulting from shallow diff

exports.DIFF_STATUS_UPDATED = DIFF_STATUS_UPDATED;
var DIFF_STATUS_REMOVED = 'removed';
exports.DIFF_STATUS_REMOVED = DIFF_STATUS_REMOVED;
var DIFF_STATUS_KEYS_UPDATED = 'updated_keys';
exports.DIFF_STATUS_KEYS_UPDATED = DIFF_STATUS_KEYS_UPDATED;
var DIFF_STATUS_ARRAY_UPDATED = 'updated_array';
exports.DIFF_STATUS_ARRAY_UPDATED = DIFF_STATUS_ARRAY_UPDATED;