import React from 'react';
import axios from './axios';

export default class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchTerm: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    handleSubmit(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            if ((this.state.searchTerm.match(/ /g) || []).length > 1) {
                this.setState({
                    error: true,
                    errorMessage: 'Please enter two search items maximum'
                });
            } else {
                axios.get(`/users?q=${this.state.searchTerm}`).then((resp) => {
                    if (resp.data.success) {
                        console.log(resp.data.data);
                        this.props.setSearchResults(resp.data.data);
                    } else {
                        this.setState({
                            error: true,
                            errorMessage: resp.data.errorMessage
                        });
                    }
                    this.setState({
                        searchTerm: ''
                    });
                }).catch((err) => {
                    console.log(err);
                });
            }
        }
    }

    render() {
        return (
            <ul>
                <li>
                    <input id='search-bar' name='searchTerm' value={this.state.searchTerm} onChange={this.handleChange} onKeyDown={this.handleSubmit} placeholder='Search for fellow Reactees' />
                    {this.state.error && <div className="error"> {this.state.errorMessage}</div>}
                </li>
            </ul>
        );
    }
}
