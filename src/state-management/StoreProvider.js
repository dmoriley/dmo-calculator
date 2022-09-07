// File contents not being used, kept for reference
import React, { useReducer } from 'react';
import PropTypes from 'prop-types';

// exporting a self invoking function that returns an object. I think (not tested) that ths will let me have multiple
// unique stores by importing from this file a new storecontext each time.
export default (() => {
  const StoreContext = React.createContext();

  /**
   * Generic store component that will provide state management to the chilren passed to it.
   * It will provide the current state, available actions and a dispatch function to change the state.
   */
  const StoreProvider = ({ children, settings }) => {
    const { initialState, actions, reducer } = settings;
    // setup the state and dispatch objects with the initial state and the reducer function
    const [state, dispatch] = useReducer(reducer, initialState);

    // return a context object that gives access to the state, actions and the reducer to change the state
    return (
      <StoreContext.Provider value={{ state, actions, dispatch }}>
        {children}
      </StoreContext.Provider>
    );
  };

  StoreProvider.propTypes = {
    /** Settings to setup the store. Include the required initialState, actions and reducer. */
    settings: PropTypes.shape({
      /** The initial state of the store */
      initialState: PropTypes.object.isRequired,
      /** The actions available for dispatch */
      actions: PropTypes.object.isRequired,
      /** The reducer that will process the actions passed to the dispatch */
      reducer: PropTypes.func.isRequired,
    }).isRequired,
  };

  return { StoreContext, StoreProvider };
})();

/*
  // how to use later

  import reducer from './src/state-management/reducer';
  import actions from './src/state-management/actions';
  import Store from './src/components/StoreProvider';

  const {StoreProvider, StoreContext} = Store;
  const initialState = {power: true, volume: 1, audioMap: 'yells', label: ''};

  const App = () => (
    <StoreProvider settings={{initialState, actions, reducer}}>
      <CssBaseline /> 
      <DrumMachine />
    </StoreProvider>
  );
*/

// https://www.jbillmann.com/using-react-hooks-to-manage-and-organize-application-state/
// https://medium.com/javascript-in-plain-english/state-management-with-react-hooks-no-redux-or-context-api-8b3035ceecf8
// https://kentcdodds.com/blog/application-state-management-with-react
