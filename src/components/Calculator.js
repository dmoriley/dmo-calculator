import React, { useState, useEffect, useCallback } from 'react';
import BackspaceIcon from '@material-ui/icons/Backspace';
import { evaluate } from 'mathjs';
import { EventEmitter } from '../events/event-emitter';
import events from '../events/events';
import { Key } from './Key';

const Calculator = () => {
  const [state, setState] = useState({history: '', current: '0', error: ''})
  const operators = ['/','*','+','-'];
  const errors = {
    LIMIT: 'DIGIT LIMIT REACHED',
    MATH: 'MATH ERROR',
    SYNTAX: 'SYNTAX ERROR'
  };

    //////////////////////////////
  // Event handling functions //
  //////////////////////////////
  
  /**
   * When a number or period is clicked
   * @param value The number clicked
   */
  const operandClicked = useCallback((value) => { // memoize function with usecallback to prevent new function creation on each render
    setState(({history, current}) => {
      // check if expression contains =, so previously evaluated
      if (history.indexOf('=') >= 0) {
        return { history: value, current: value, error: ''};
      }

      // error if length longer than 18 characters
      if(current.length === 18) {
        setTimeout(() => {
          // after 1.5s clear error
          setState({history, current, error: ''});
        }, 1500);
        return {history, current, error: errors.LIMIT}
      }

      // check if the value is an operator and reset it to blank to make way for a number
      if(operators.indexOf(current) >= 0) {
        current = '';
      }

      if(current === '0' && value === '0') {
        // prevent multiple zeros in a row on init
        value = '';
      } else if((current === '' || current === '0') && value === '.') {
        // selecting a decimal right after an operator, front pad decimal with a zero
        // or 
        // selecting . on init
        value = '0.';
        current = '';
      } else if(current === '0' && value !== '.') {
        // selecting a number after init, get rid of zero at front
        current = ''
      } 

      const newOperand = current + value;
      if(isValidOperand(newOperand)) {
        return {history: history + value, current: newOperand, error: ''};
      } else {
        // invalid operand, return the previous
        return {history, current, error: ''};
      }
    });
  }, [errors, operators]);

  /**
   * When a operator like + - X / is clicked
   * @param value The operator clicked
   */
  const operatorClicked = useCallback((value) => { // memoize function with usecallback to prevent new function creation on each render
    setState(({history, current, error}) => {
      if(error) {
        return { history, current, error };
      }
      // pressed operator after evaluating, continue with result
      if(history.indexOf('=') > -1) {
        return { history: current + value, current: value, error: ''};
      }

      // check if history is blank and pad a zero
      if (history.length === 0) {
        history += '0';
      }

      let newHistory = '';
      if (
        operators.indexOf(current) < 0 || 
        (value === '-' && history.match(/^\d*[-+/*]$/)) 
      ) {
        // match for when they put a negative sign 
        // clicked an operator from a numbers
        newHistory =  history + value;
      } else {
        // clicked an operator from an operator
        // replace last character in the history with the new operator
        if(history.match(/\d[-+/*]-$/)) {
          // has negative sign so replace operator and negative sign with new operator
          newHistory = history.slice(0, history.length-2) + value;  
        } else {
          // no negative sign
          newHistory = history.slice(0, history.length-1) + value;
        }
      }
      return {history: newHistory, current: value, error: ''};
    });
  }, [operators]);

  /** Remove the last character entered */
  const correction = useCallback(() => {
    if (state.history.length === 0 || state.history.indexOf('=') > -1) {
      return;    
    }

    setState(s => {
      const newHistory = s.history.slice(0, s.history.length - 1);
      let newCurrent = [];
  
      if (!Number.isInteger(+newHistory.charAt(newHistory.length - 1))) {
        // if char removed was a number and new last charater is operator
        newCurrent[0] = newHistory.charAt(newHistory.length - 1);
      } else if (newHistory.length === 0) {
        newCurrent = '0';
      } else {
        // get all numbers in history and assign last one to newCurrent
        const numbers = newHistory.match(/\d*/g).filter(i => i);
        newCurrent = numbers[numbers.length - 1];
      }

      return { 
        ...s,
        current: newCurrent,
        history: newHistory,
      };
    });
  }, [state.history]);

  /** Initial the calculation */
  const calculate = useCallback(() => {
    setState(s => {
      if (s.error || s.history.length === 0) {
        return s;
      }

      // pressing = after evaluating does nothing
      if (s.history.indexOf('=') > -1) { 
        return s;
      }

      // check if operation only has left number and operator, fill right operator with left
      if (s.history.match(/^\d*[+-/*]$/)) {
        s.history += s.history.slice(0, s.history.length - 1);
      }

      let newHistory = '';
      let result = '';
      try {
        result = evaluate(s.history);
        newHistory = s.history + '=' + result;        
      } catch (error) {

        setTimeout(() => {
          // after 1.5s clear error
          setState({history: s.history, current: s.current, error: ''});
        }, 1500);
        return {history: s.history, current: s.current, error: errors.SYNTAX}
      }

      return {history: newHistory, current: result, error: ''};
    });
  }, [errors.SYNTAX]);

  /** Clear the current calculation from the calculator */
  const clear = useCallback(() => {
    setState(prev => {
      if(prev.error) {
        return prev;
      } else {
        return {history: '', current: '0', error: ''};
      }
    });
  }, []);

  // subscribe and unsubscribe from the events 
  useEffect(() => {
    EventEmitter.subscribe(events.OPERAND_CLICKED, operandClicked);
    EventEmitter.subscribe(events.OPERATOR_CLICKED, operatorClicked);
    EventEmitter.subscribe(events.CALCULATE, calculate);
    EventEmitter.subscribe(events.CLEAR, clear);
    EventEmitter.subscribe(events.CORRECTION, correction);
    return () => {
      EventEmitter.unsubscribe(events.OPERAND_CLICKED);
      EventEmitter.unsubscribe(events.OPERATOR_CLICKED);
      EventEmitter.unsubscribe(events.CALCULATE);
      EventEmitter.unsubscribe(events.CLEAR);
      EventEmitter.unsubscribe(events.CORRECTION);
    }
  }, [operandClicked, operatorClicked, correction, calculate, clear])

  //////////////////////////////
  //      Other functions     //
  //////////////////////////////

  /**
   * Determine if a value is a valid operand
   * @param {string} Value to be tested
   * @return {boolean} True or false whether it was valid or not
   */
  function isValidOperand(value) {
    return value.match(/^\d*(\.)?(\d*)?$/);
  }

  return (
    <main className="calculator-container">
      <div className="display-container">
        <div className="history">{state.history}</div>
        <div className="display" id="display">{state.error || state.current}</div>
      </div>
      <Key id="clear" eventType={events.CLEAR} label="AC" />
      <Key classes="operator-button" eventType={events.CORRECTION} id="correction"><BackspaceIcon /></Key>
      <Key classes="operator-button" eventType={events.OPERATOR_CLICKED} label="/" id="divide"/>
      <Key classes="operator-button" eventType={events.OPERATOR_CLICKED} label="X" value="*" id="multiply"/>
      <Key label="7" id="seven"/>
      <Key label="8" id="eight"/>
      <Key label="9" id="nine"/>
      <Key classes="operator-button" id="subtract" eventType={events.OPERATOR_CLICKED} label="-" />
      <Key label="4" id="four"/>
      <Key label="5" id="five"/>
      <Key label="6" id="six"/>
      <Key classes="operator-button" id="add" eventType={events.OPERATOR_CLICKED} label="+" />
      <Key label="1" id="one"/>
      <Key label="2" id="two"/>
      <Key label="3" id="three"/>
      <Key label="." id="decimal"/>
      <Key id="zero" label="0"/>
      <Key id="equals" eventType={events.CALCULATE} label="=" />
    </main>
  );
}

export default Calculator;