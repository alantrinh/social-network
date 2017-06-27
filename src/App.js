import React from 'react';
import axios from './axios';
import {Link} from 'react-router';
import ProfileImageUpload from './ProfileImageUpload';
import SearchBar from './SearchBar';
import {browserHistory} from 'react-router';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showProfileImageUpload: false,
        };
        this.setImage = this.setImage.bind(this);
        this.showProfileImageUpload = this.showProfileImageUpload.bind(this);
        this.setBio = this.setBio.bind(this);
        this.setSearchResults = this.setSearchResults.bind(this);
    }

    componentDidMount() {
        axios.get('/user').then((resp) => {
            this.setState(resp.data);
            if (this.state.imageUrl == null) {
                this.setImage('/images/profile_placeholder.png');
            }
        });
    }

    showProfileImageUpload() {
        this.setState(prevState => ({
            showProfileImageUpload: !prevState.showProfileImageUpload
        }));
    }

    setImage(url) {
        this.setState({
            imageUrl: url
        });
    }

    setBio(bioUpdate) {
        this.setState({
            bio: bioUpdate
        });
    }

    setSearchResults(searchResults) {
        this.setState({
            searchResults: searchResults
        });
        browserHistory.push('/search');
    }

    render() {
        const children = React.cloneElement(this.props.children, {
            id: this.state.id,
            imageUrl: this.state.imageUrl,
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            bio: this.state.bio,
            setBio: this.setBio,
            searchResults: this.state.searchResults
        });
        return (
            <div id="root">
                <header>
                    <ul>
                        <li><Link to="/"><Logo /></Link></li>
                        <li><h3>ReactIONAIRES</h3></li>
                    </ul>

                    <SearchBar setSearchResults = {this.setSearchResults}/>

                    <ul>
                        <li><Link to='/chat'>Chat</Link></li>
                        <li><Link to='/online'>Online</Link></li>
                        <li><Link to='/friends'>Friends</Link></li>
                        <li><img className='profile-image' src={this.state.imageUrl} alt={`${this.state.firstName} ${this.state.lastName}`} onClick={this.showProfileImageUpload}/>
                        </li>
                    </ul>
                </header>
                {this.state.showProfileImageUpload && <ProfileImageUpload setImage={this.setImage} showProfileImageUpload={this.showProfileImageUpload} />}

                {children}
            </div>
        );
    }
}

function Logo() {
    return <img className='logo-small' src={'/images/logo.png'} />;
}
