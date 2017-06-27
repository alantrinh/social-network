import React from 'react';
import {browserHistory, Link} from 'react-router';

export default class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props;
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.searchResults != this.state.searchResults) {
            this.setState({
                searchResults: nextProps.searchResults
            });
            browserHistory.push('/search');
        }
    }

    render() {
        let searchResults = '';

        if (this.state.searchResults) {
            searchResults = this.state.searchResults.map((searchResult) => {
                return (
                    <div className='search-result'>
                        <Link to={'/user/' + searchResult.id}>
                        <img src={searchResult['image_url'] ? searchResult['image_url'] : '/images/profile_placeholder.png'} />
                        <div>{searchResult['first_name']} {searchResult['last_name']}</div>
                        </Link>
                    </div>
                );
            });
        }

        return (
            <div>
                {searchResults}
            </div>
        );
    }
}
