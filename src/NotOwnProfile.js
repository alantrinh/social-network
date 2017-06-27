import React from 'react';
import axios from './axios';
import {browserHistory, Link} from 'react-router';
import FriendRequestButton from './FriendRequestButton';

export default class NotOwnProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            id: this.props.params.id
        };

    }

    componentDidMount() {
        axios.get(`/user?id=${this.state.id}`).then((resp) => {
            if (resp.data.redirect) {
                browserHistory.push('/');
            } else if (resp.data.error) {
                this.setState({
                    error: true,
                    errorMessage: resp.data.errorMessage
                });
            } else {
                this.setState(resp.data);
                if (this.state.imageUrl == null) {
                    this.setState({
                        imageUrl: '/images/profile_placeholder.png'
                    });
                }
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.id != this.state.id) {
            this.setState({
                id: nextProps.params.id
            });
            this.componentDidMount();
        }
    }

    render() {
        return (
            <div id='profile-wrapper'>
                {this.state.error ? this.state.errorMessage : (
                    <div id='profile-contents'>
                        <div>
                            <img className='bio-profile-image' src={this.state.imageUrl} />
                            <FriendRequestButton id={this.state.id} />
                        </div>
                        <div className='profile'>
                            {this.state.firstName} {this.state.lastName}
                            <p>
                            {this.state.bio &&
                                    <div className='bio-profile'>
                                        {this.state.bio}
                                    </div>
                            }
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
