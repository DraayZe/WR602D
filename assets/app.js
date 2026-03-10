import './stimulus_bootstrap.js';
import './styles/app.css';

import { registerReactControllerComponents } from '@symfony/ux-react';
import Hello from './react/dist/Hello.js';
import Home from './react/dist/pages/Home.js';
import Navbar from './react/dist/components/Navbar.js';
import Footer from './react/dist/components/Footer.js';
import Login from './react/dist/pages/auth/Login.js';
import Register from './react/dist/pages/auth/Register.js';
import ResetRequest from './react/dist/pages/auth/ResetRequest.js';
import ResetPassword from './react/dist/pages/auth/ResetPassword.js';
import CheckEmail from './react/dist/pages/auth/CheckEmail.js';
import UrlToPdf from './react/dist/pages/tools/UrlToPdf.js';
import Profile from './react/dist/pages/Profile.js';
import PaymentSuccess from './react/dist/pages/payment/success.js';
import PaymentCancel from './react/dist/pages/payment/cancel.js';

registerReactControllerComponents({
    'Hello': Hello,
    'pages/Home': Home,
    'components/Navbar': Navbar,
    'components/Footer': Footer,
    'pages/auth/Login': Login,
    'pages/auth/Register': Register,
    'pages/auth/ResetRequest': ResetRequest,
    'pages/auth/ResetPassword': ResetPassword,
    'pages/auth/CheckEmail': CheckEmail,
    'pages/tools/UrlToPdf': UrlToPdf,
    'pages/Profile': Profile,
    'pages/payment/success': PaymentSuccess,
    'pages/payment/cancel': PaymentCancel,
});
