import './stimulus_bootstrap.js';
import './styles/app.css';

import { registerReactControllerComponents } from '@symfony/ux-react';
import Hello from './react/dist/Hello.js';
import Home from './react/dist/pages/Home.js';

registerReactControllerComponents({
    'Hello': Hello,
    'pages/Home': Home,
});
