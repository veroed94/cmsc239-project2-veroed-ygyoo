import React from 'react';
import ReactDOM from 'react-dom';

import {kmeans} from './components/root.js';

const domReady = require('domready');
domReady(() => {
  kmeans();
})
