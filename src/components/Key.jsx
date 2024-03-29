import PropTypes from "prop-types";
import React from "react";
import { EventEmitter } from "../events/event-emitter";
import events from "../events/events";

function combineClasses(cssClass, cssClassArr) {
  cssClassArr.push(cssClass);
  return cssClassArr.join(" ");
}

const Key = ({ label, value, id, eventType, classes, children }) => {
  return (
    <div
      id={id}
      onClick={() =>
        EventEmitter.emit(eventType || events.OPERAND_CLICKED, value || label)
      }
      className={combineClasses("calculator-button", [classes])}
    >
      {label || children}
    </div>
  );
};

Key.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  id: PropTypes.string,
  eventType: PropTypes.string,
  classes: PropTypes.string,
};

export default Key;
