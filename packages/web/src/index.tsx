import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import * as _ from 'lodash';

declare let module: any;

const root = document.getElementById('root');



ReactDOM.render(
    <App/>
    , root);

if (module.hot) {
    module.hot.accept();
}

