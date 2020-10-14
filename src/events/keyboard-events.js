import { EventEmitter } from "./event-emitter";
import events from './events';

const _setupKeyboard = (evt) => {
  if ((+evt.key >= 0 && evt.key <= 9) || evt.key === '.') {
    // number or decimal pressed
    EventEmitter.emit(events.OPERAND_CLICKED, evt.key);
  } else if ('/*-+'.indexOf(evt.key) > -1) {
    // operator pressed
    EventEmitter.emit(events.OPERATOR_CLICKED, evt.key);
  } else if (evt.key === 'Enter' || evt.key === '=') {
    if (evt.key === 'Enter' && evt.ctrlKey) {
      // clear
      EventEmitter.emit(events.CLEAR);
    } else {
      // evaluate
      EventEmitter.emit(events.CALCULATE);
    }
  } else if (evt.key === 'Backspace') {
    // correction
    EventEmitter.emit(events.CORRECTION);
  }

  // else ignore all other keys
}

/** Add keydown event listener to the window for calculator */
export const setupKeyboardSupport = () => window.addEventListener('keydown', _setupKeyboard);

/** Remove keydown event listener from the window for calculator */
export const removeKeyboardSupport = () => window.removeEventListener('keydown', _setupKeyboard);