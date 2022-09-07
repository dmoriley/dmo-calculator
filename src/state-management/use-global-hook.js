// File contents not being used, kept for reference

/**
 * Set a new state for the global state.
 * @param newState The new state to set
 */
function setState(newState) {
  this.state = { ...this.state, ...newState };
  this.listeners.forEach((listener) => {
    // pretty sure we have to set the state so that React initiats a re-render if needed
    listener(this.state);
  });
}

/**
 * Custom hook that adds a new listener on mount
 * @param React React context
 */
function useCustom(React) {
  // get the setState method from the second value returned from useState
  const newListener = React.useState()[1];
  React.useEffect(() => {
    this.listeners.push(newListener); // push the setState listener on the listeners array
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== newListener
      );
    };
  }, []);
  return [this.state, this.actions]; // returning actions because they are the only way to modifiy, no direct access to setState
}

/**
 * Associate the actions with the store provided by binding the store to the action functions.
 * @param store The store where the state is stored
 * @param actions The actions to modify the state. [key: string]: function | object
 */
function associateActions(store, actions) {
  const associatedActions = {};
  Object.keys(actions).forEach((key) => {
    if (typeof actions[key] === 'function') {
      // using bind doesnt not return the result of the function but a new function with the context assigned.
      // the first param of bind is the context for the function and providing null/undefined defaults the context
      // of the function to global context. The subsequent params are binding to the params of the signature
      associatedActions[key] = actions[key].bind(null, store);
    }
    if (typeof actions[key] === 'object') {
      // if object recursively call the method and assign assiciated action to key
      // would result in action called like actions.counter.add(1)
      associatedActions[key] = associateActions(store, actions[key]);
    }
  });
  return associatedActions;
}

/**
 * Set up the global hook
 * @param React React context to use for useState/useEffect
 * @param initialState The initial state of the stored
 * @param The actions to change the state of the store
 */
const useGlobalHook = (React, initialState, actions) => {
  const store = { state: initialState, listeners: [] };
  store.setState = setState.bind(store);
  store.actions = associateActions(store, actions);
  // bind the stores context (which includes the state and actions) to the returned function
  return useCustom.bind(store, React); // returns new custom hook function
};

export default useGlobalHook;

// https://medium.com/javascript-in-plain-english/state-management-with-react-hooks-no-redux-or-context-api-8b3035ceecf8
