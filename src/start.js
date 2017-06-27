import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, Link, IndexRoute, hashHistory, browserHistory} from 'react-router';
import axios from './axios';
import Welcome from './Welcome';
import Registration from './Register';
import Login from './Login';
import App from './App';
import Profile from './Profile';
import NotOwnProfile from './NotOwnProfile';
import Friends from './Friends';
import Search from './Search';
import OnlineNow from './OnlineNow';
import Chat from './Chat';
import {getSocket} from './Socket'

const router = (
    <Router history={browserHistory}>
        <Route path='/' component={App}>
            <Route path='user/:id' component={NotOwnProfile} />
            <Route path='friends' component={Friends} />
            <Route path='search' component={Search} />
            <Route path='online' component={OnlineNow} />
            <Route path='chat' component={Chat} />
            <IndexRoute component={Profile} />
        </Route>
    </Router>
);

let elem = router;
if (location.pathname == '/welcome') {
    elem = (
        <Router history={hashHistory}>
            <Route path='/' component={Welcome}>
                <Route path='/login' component={Login} />
                <IndexRoute component={Registration} />
            </Route>
        </Router>
    );
}

ReactDOM.render(
    elem,
    document.querySelector('main')
);

//=====keep track of connections to the site=====//

if (location.pathname != '/welcome') {
    getSocket();
}
