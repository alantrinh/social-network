import React from 'react';
import axios from './axios';
import {Link} from 'react-router';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    handleSubmit(e) {
        e.preventDefault();
        const {email, password} = this.state;
        axios.post('/authenticateUser', {
            email, password
        }).then((resp) => {
            if (resp.data.success) {
                location.href = '/';
            } else {
                this.setState({
                    error: true,
                    errorMessage: resp.data.errorMessage
                });
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    render () {
        return (
            <div>
                <h2>Log In</h2>
                {this.state.error && <div className="error"> {this.state.errorMessage}</div>}
                <form  onSubmit={this.handleSubmit}>
                    <p><input type="text" name="email" placeholder="Email" value={this.state.email} onChange={this.handleChange} /></p>
                    <p><input type="password" name="password" placeholder="Password" value={this.state.password} onChange={this.handleChange} /></p>
                    <p><input type="submit" value="Submit" /></p>
                    <p><Link to="/">Not yet a member? Register here</Link></p>
                </form>
            </div>
        );
    }
}
