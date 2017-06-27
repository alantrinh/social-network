import axios from 'axios';

var instance = axios.create({ //special instance of axios with csrf protection
    xsrfCookieName: 't',
    xsrfHeaderName: 'csrf-token'
});

export default instance;
