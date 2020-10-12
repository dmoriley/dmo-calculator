import React from 'react';
import { render } from 'react-dom';
import './styles/styles.scss';
import Calculator from './components/Calculator';
import CssBaseline from '@material-ui/core/CssBaseline';

const App = () => (
  <div>
    <CssBaseline /> {/* used instead of normalize cause its included in material-ui */}
    <div className="box-layout">
      <Calculator />  
      <footer>
        <p>Designed and Coded by <br/> <a href="https://github.com/dmoriley" target="_blank" rel="noopener noreferrer">David O'Riley </a></p>
      </footer>
    </div>
  </div>
);

render(<App />, document.querySelector('#root'));
