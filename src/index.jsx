import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/styles.scss';
import Calculator from './components/Calculator';

const App = () => (
  <div>
    <div className="box-layout">
      <Calculator />
      <footer>
        <p>
          Designed and Coded by <br />
          <a
            href="https://github.com/dmoriley"
            target="_blank"
            rel="noopener noreferrer"
          >
            David O'Riley
          </a>
        </p>
      </footer>
    </div>
  </div>
);

const container = document.querySelector('#root');
const root = createRoot(container);
root.render(<App />);
