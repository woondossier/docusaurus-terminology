"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactRouterDom = require("react-router-dom");

var _core = require("@material-ui/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default = Term = function Term(props) {
  return /*#__PURE__*/_react["default"].createElement(_core.Tooltip, {
    title: props.popup,
    arrow: true
  }, /*#__PURE__*/_react["default"].createElement(_reactRouterDom.Link, {
    to: props.reference
  }, /*#__PURE__*/_react["default"].createElement("span", {
    className: "term"
  }, props.children)));
};

exports["default"] = _default;