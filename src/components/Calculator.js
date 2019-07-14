import React, { useState, useEffect } from 'react';
import { evaluate } from 'mathjs';
import { EventEmitter } from '../events/event-emitter';
import events from '../events/events';
import { Key } from './Key';

const Calculator = () => {
  const [state, setState] = useState({history: '', current: '0'})
  const operators = ['/','*','+','-'];
  const errors = {LIMIT: 'DIGIT LIMIT REACHED'};

  // subscribe and unsubscribe from the events 
  useEffect(() => {
    EventEmitter.subscribe(events.OPERAND_CLICKED, operandClicked);
    EventEmitter.subscribe(events.OPERATOR_CLICKED, operatorClicked);
    EventEmitter.subscribe(events.CALCULATE, calculate);
    EventEmitter.subscribe(events.CLEAR, clear);
    return () => {
      EventEmitter.unsubscribe(events.OPERAND_CLICKED);
      EventEmitter.unsubscribe(events.OPERATOR_CLICKED);
      EventEmitter.unsubscribe(events.CALCULATE);
      EventEmitter.unsubscribe(events.CLEAR);
    }
  },[])

  //////////////////////////////
  //      Other functions     //
  //////////////////////////////

  /**
   * Determine if a value is a valid operand
   * @param {string} Value to be tested
   * @return {boolean}True or value whether it was valid or not
   */
  function isValidOperand(value) {
    const validOperand = /^\d*(\.)?(\d*)?$/;
    return value.match(validOperand);
  }
  //////////////////////////////
  // Event handling functions //
  //////////////////////////////
  
  /**
   * When a number or period is clicked
   * @param value The number clicked
   */
  function operandClicked(value) {
    setState(({history, current}) => {
      // check if expression contains =, so previously evaluated
      if(history.indexOf('=') >= 0) {
        return {history: value, current: value};
      }

      // error if length longer than 18 characters
      if(current.length === 18) {
        setTimeout(() => {
          setState({history, current});
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
        return {history: history + value, current: newOperand};
      } else {
        // invalid operand, return the previous
        return {history, current};
      }
    });
  }

  /**
   * When a operator like + - X / is clicked
   * @param value The operator clicked
   */
  const operatorClicked = (value) => {
    setState(({history, current, error}) => {
      if(error) return {history,current,error};
      // pressed operator after evaluating, continue with result
      if(history.indexOf('=') > -1) {
        return {history: current + value, current: value};
      }

      const newHistory = '';
      if(operators.indexOf(current) < 0 || 
        (value === '-' && history.match(/\d[-+/\*]$/)) ) {
        // match for when they put a negative sign 
        // clicked an operator from a numbers
        newHistory =  history + value;
      } else {
        // clicked an operator from an operator
        // replace last character in the history with the new operator
        if(history.match(/\d[-+/\*]-$/)) {
          // has negative sign so replace operator and negative sign with new operator
          newHistory = history.slice(0, history.length-2) + value;  
        } else {
          // no negative sign
          newHistory = history.slice(0, history.length-1) + value;
        }
      }
      return {history: newHistory, current: value};
    });
  }

  /** Initial the calculation */
  const calculate = (value) => {
    setState(s => {
      if(s.error) {
        return s;
      }
      if(s.history.indexOf('=') > -1) return s; // pressing = after evaluating doesn nothing
      const result = evaluate(s.history);
      return {history: s.history + '=' + result, current: result};
    });
  }

  /** Clear the current calculation from the calculator */
  const clear = (value) => {
    setState(prev => {
      if(prev.error) {
        return prev;
      } else {
        return {history: '', current: '0'};
      }
    });
  }

  return (
    <main className="calculator-container">
      <div className="display-container">
        <div className="history">{state.history}</div>
        <div className="display" id="display">{state.error || state.current}</div>
      </div>
      <Key id="clear" eventType={events.CLEAR} label="AC" />
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
    </main >
  );
}
export default Calculator;