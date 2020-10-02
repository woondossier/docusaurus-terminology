"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = Term;

var _react = _interopRequireDefault(require("react"));

var _core = require("@material-ui/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function Term(props) {
  return /*#__PURE__*/_react["default"].createElement(_core.Tooltip, {
    title: props.popup,
    arrow: true
  }, /*#__PURE__*/_react["default"].createElement("a", {
    href: props.reference
  }, /*#__PURE__*/_react["default"].createElement("span", {
    className: "term"
  }, props.children)));
}