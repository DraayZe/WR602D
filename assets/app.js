import './stimulus_bootstrap.js';
import './styles/app.css';

import { registerReactControllerComponents } from '@symfony/ux-react';
import Hello from './react/dist/Hello.js';
import Home from './react/dist/pages/Home.js';
import Navbar from './react/dist/components/Navbar.js';
import Footer from './react/dist/components/Footer.js';

registerReactControllerComponents({
    'Hello': Hello,
    'pages/Home': Home,
    'components/Navbar': Navbar,
    'components/Footer': Footer,
});
