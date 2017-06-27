import React from 'react';
import axios from './axios';
import {Link} from 'react-router';
import {getSocket} from './Socket';
const socket = getSocket();

export default class OnlineNow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

    }

    componentDidMount() {
        axios.get('/onlineNow').then((resp) => {
            this.setState(resp.data);
            socket.on('updateCurrentOnlineUsers', () => {
                axios.get('/onlineNow').then((resp) => {
                    this.setState(resp.data);
                });
            });
        });
    }

    render() {
        let onlineUsers = '';

        if (this.state.onlineUserProfiles) {
            onlineUsers = this.state.onlineUserProfiles.map((onlineUserProfile) => {
                return (
                    <div className='online-user' key={onlineUserProfile.id}> {/*adding keys on user IDs removes duplicates*/}
                        <Link to={'/user/' + onlineUserProfile.id}>
                        <img src={onlineUserProfile['image_url'] ? onlineUserProfile['image_url'] : '/images/profile_placeholder.png'} />
                        <div>{onlineUserProfile['first_name']} {onlineUserProfile['last_name']}</div>
                        </Link>
                    </div>
                );
            });
        } else {
            return (
                <div>
                    No users currently online
                </div>
            );
        }

        return (
            <div>
                {onlineUsers}
            </div>
        );
    }
}
