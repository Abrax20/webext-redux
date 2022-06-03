"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash.assignin"));

var _constants = require("../constants");

var _serialization = require("../serialization");

var _patch = _interopRequireDefault(require("../strategies/shallowDiff/patch"));

var _util = require("../util");

var _excluded = ["fromBackground"];

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var backgroundErrPrefix = '\nLooks like there is an error in the background page. ' + 'You might want to inspect your background page for more details.\n';
var defaultOpts = {
  portName: _constants.DEFAULT_PORT_NAME,
  state: {},
  extensionId: null,
  serializer: _serialization.noop,
  deserializer: _serialization.noop,
  patchStrategy: _patch["default"],
  maxReconnects: 10
};

var Store = /*#__PURE__*/function () {
  /**
   * Creates a new Proxy store
   * @param  {object} options An object of form {portName, state, extensionId, serializer, deserializer, diffStrategy}, where `portName` is a required string and defines the name of the port for state transition changes, `state` is the initial state of this store (default `{}`) `extensionId` is the extension id as defined by browserAPI when extension is loaded (default `''`), `serializer` is a function to serialize outgoing message payloads (default is passthrough), `deserializer` is a function to deserialize incoming message payloads (default is passthrough), and patchStrategy is one of the included patching strategies (default is shallow diff) or a custom patching function.
   */
  function Store() {
    var _this = this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultOpts,
        _ref$portName = _ref.portName,
        portName = _ref$portName === void 0 ? defaultOpts.portName : _ref$portName,
        _ref$state = _ref.state,
        state = _ref$state === void 0 ? defaultOpts.state : _ref$state,
        _ref$extensionId = _ref.extensionId,
        extensionId = _ref$extensionId === void 0 ? defaultOpts.extensionId : _ref$extensionId,
        _ref$serializer = _ref.serializer,
        serializer = _ref$serializer === void 0 ? defaultOpts.serializer : _ref$serializer,
        _ref$deserializer = _ref.deserializer,
        deserializer = _ref$deserializer === void 0 ? defaultOpts.deserializer : _ref$deserializer,
        _ref$patchStrategy = _ref.patchStrategy,
        patchStrategy = _ref$patchStrategy === void 0 ? defaultOpts.patchStrategy : _ref$patchStrategy,
        _ref$maxReconnects = _ref.maxReconnects,
        maxReconnects = _ref$maxReconnects === void 0 ? defaultOpts.maxReconnects : _ref$maxReconnects;

    _classCallCheck(this, Store);

    if (!portName) {
      throw new Error('portName is required in options');
    }

    if (typeof serializer !== 'function') {
      throw new Error('serializer must be a function');
    }

    if (typeof deserializer !== 'function') {
      throw new Error('deserializer must be a function');
    }

    if (typeof patchStrategy !== 'function') {
      throw new Error('patchStrategy must be one of the included patching strategies or a custom patching function');
    }

    this.maxReconnects = maxReconnects;
    this.portName = portName;
    this.readyResolved = false;
    this.readyPromise = new Promise(function (resolve) {
      _this.readyResolve = resolve;
    });
    this.browserAPI = (0, _util.getBrowserAPI)();
    this.extensionId = extensionId; // keep the extensionId as an instance variable

    this.serializedMessageSender = (0, _serialization.withSerializer)(serializer)(function () {
      var _this$browserAPI$runt;

      (_this$browserAPI$runt = _this.browserAPI.runtime).sendMessage.apply(_this$browserAPI$runt, arguments);
    }, 1);
    this.listeners = [];
    this.state = state;
    this.patchStrategy = patchStrategy;
    this.safetyHandler = this.safetyHandler.bind(this);

    if (this.browserAPI.runtime.onMessage) {
      this.safetyMessage = this.browserAPI.runtime.onMessage.addListener(this.safetyHandler);
    }

    this.dispatch = this.dispatch.bind(this); // add this context to dispatch
    // finally connect

    this.connect(deserializer);
  }
  /**
   * Connects and creates a port for handling messages between background and
   * this store. Automatically reconnects when port becomes disconnected.
   */


  _createClass(Store, [{
    key: "connect",
    value: function connect(deserializer) {
      var _this2 = this;

      var attempts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (attempts > this.maxReconnects) {
        throw new Error("Too many connection attempts");
      } // wake up service worker and then connect


      this.port = this.browserAPI.runtime.connect(this.extensionId, {
        name: this.portName
      });
      this.port.onDisconnect.addListener(function () {
        setTimeout(function () {
          return _this2.connect(deserializer, ++attempts);
        }, 0);
      });
      this.serializedPortListener = (0, _serialization.withDeserializer)(deserializer)(function () {
        var _this2$port$onMessage;

        (_this2$port$onMessage = _this2.port.onMessage).addListener.apply(_this2$port$onMessage, arguments);
      }); // Don't use shouldDeserialize here, since no one else should be using this port

      this.serializedPortListener(function (message) {
        switch (message.type) {
          case _constants.ACTION_TYPE:
            _this2.dispatch(_objectSpread(_objectSpread({}, message.payload), {}, {
              fromBackground: true
            }));

            break;

          case _constants.STATE_TYPE:
            _this2.replaceState(message.payload);

            if (!_this2.readyResolved) {
              _this2.readyResolved = true;

              _this2.readyResolve();
            }

            break;

          case _constants.PATCH_STATE_TYPE:
            _this2.patchState(message.payload);

            break;

          default: // do nothing

        }
      });
    }
    /**
    * Returns a promise that resolves when the store is ready. Optionally a callback may be passed in instead.
    * @param [function] callback An optional callback that may be passed in and will fire when the store is ready.
    * @return {object} promise A promise that resolves when the store has established a connection with the background page.
    */

  }, {
    key: "ready",
    value: function ready() {
      var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (cb !== null) {
        return this.readyPromise.then(cb);
      }

      return this.readyPromise;
    }
    /**
     * Subscribes a listener function for all state changes
     * @param  {function} listener A listener function to be called when store state changes
     * @return {function}          An unsubscribe function which can be called to remove the listener from state updates
     */

  }, {
    key: "subscribe",
    value: function subscribe(listener) {
      var _this3 = this;

      this.listeners.push(listener);
      return function () {
        _this3.listeners = _this3.listeners.filter(function (l) {
          return l !== listener;
        });
      };
    }
    /**
     * Replaces the state for only the keys in the updated state. Notifies all listeners of state change.
     * @param {object} state the new (partial) redux state
     */

  }, {
    key: "patchState",
    value: function patchState(difference) {
      this.state = this.patchStrategy(this.state, difference);
      this.listeners.forEach(function (l) {
        return l();
      });
    }
    /**
     * Replace the current state with a new state. Notifies all listeners of state change.
     * @param  {object} state The new state for the store
     */

  }, {
    key: "replaceState",
    value: function replaceState(state) {
      this.state = state;
      this.listeners.forEach(function (l) {
        return l();
      });
    }
    /**
     * Get the current state of the store
     * @return {object} the current store state
     */

  }, {
    key: "getState",
    value: function getState() {
      return this.state;
    }
    /**
     * Stub function to stay consistent with Redux Store API. No-op.
     */

  }, {
    key: "replaceReducer",
    value: function replaceReducer() {
      return;
    }
    /**
     * Dispatch an action to the background using messaging passing
     * @param  {object} data The action data to dispatch
     * @return {Promise}     Promise that will resolve/reject based on the action response from the background
     */

  }, {
    key: "dispatch",
    value: function dispatch() {
      var _this4 = this;

      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          fromBackground = _ref2.fromBackground,
          data = _objectWithoutProperties(_ref2, _excluded);

      if (Boolean(fromBackground)) {
        // don't need to message this dispatch back to the background because it originated there
        return Promise.resolve(true);
      }

      return new Promise(function (resolve, reject) {
        _this4.serializedMessageSender(_this4.extensionId, {
          type: _constants.DISPATCH_TYPE,
          portName: _this4.portName,
          payload: data
        }, null, function (resp) {
          if (!resp) {
            var _error = _this4.browserAPI.runtime.lastError;
            var bgErr = new Error("".concat(backgroundErrPrefix).concat(_error));
            reject((0, _lodash["default"])(bgErr, _error));
            return;
          }

          var error = resp.error,
              value = resp.value;

          if (error) {
            var _bgErr = new Error("".concat(backgroundErrPrefix).concat(error));

            reject((0, _lodash["default"])(_bgErr, error));
          } else {
            resolve(value && value.payload);
          }
        });
      });
    }
  }, {
    key: "safetyHandler",
    value: function safetyHandler(message) {
      if (message.action === 'storeReady' && message.portName === this.portName) {
        // Remove Saftey Listener
        this.browserAPI.runtime.onMessage.removeListener(this.safetyHandler); // Resolve if readyPromise has not been resolved.

        if (!this.readyResolved) {
          this.readyResolved = true;
          this.readyResolve();
        }
      }
    }
  }]);

  return Store;
}();

var _default = Store;
exports["default"] = _default;