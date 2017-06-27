import React from 'react';
import axios from './axios';
import {Link} from 'react-router';

export default class Friends extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.acceptFriendRequest = this.acceptFriendRequest.bind(this);
        this.cancelFriendRequest = this.cancelFriendRequest.bind(this);
        this.unfriend = this.unfriend.bind(this);
    }

    componentDidMount() {
        axios.get(`/getReceivedFriendRequests`).then((resp) => {
            this.setState({
                receivedFriendRequests: resp.data.data
            });
        });

        axios.get('/getSentFriendRequests').then((resp) => {
            this.setState({
                sentFriendRequests: resp.data.data
            });
        });

        axios.get('/getFriends').then((resp) => {
            this.setState({
                friends: resp.data.data
            });
        });
    }

    acceptFriendRequest(e) {
        axios.post(`/acceptFriendRequest/${e.target.id}`).then((resp) => {
            if (resp.data.errorMessage) {
                console.log(resp.data.errorMessage);
            }
            axios.get(`/getReceivedFriendRequests`).then((resp) => {
                this.setState({
                    receivedFriendRequests: resp.data.data
                });
            });

            axios.get('/getFriends').then((resp) => {
                this.setState({
                    friends: resp.data.data
                });
            });
        });
    }

    cancelFriendRequest(e) {
        axios.post(`/cancelFriendRequest/${e.target.id}`).then((resp) => {
            if (resp.data.errorMessage) {
                console.log(resp.data.errorMessage);
            }
            axios.get('/getSentFriendRequests').then((resp) => {
                this.setState({
                    sentFriendRequests: resp.data.data
                });
            });
        });
    }

    unfriend(e) {
        axios.post(`/unfriend/${e.target.id}`).then((resp) => {
            if (resp.data.errorMessage) {
                console.log(resp.data.errorMessage);
            }
            axios.get('/getFriends').then((resp) => {
                this.setState({
                    friends: resp.data.data
                });
            });
        });
    }

    render() {
        let receivedFriendRequests = '';
        let sentFriendRequests = '';
        let friends = '';

        if (this.state.receivedFriendRequests) {
            receivedFriendRequests = this.state.receivedFriendRequests.map((receivedFriendRequest) => {
                return (
                    <div className='friend-request' key={receivedFriendRequest.id}>
                        <Link to={'/user/' + receivedFriendRequest['sender_id']}>
                            <img src={receivedFriendRequest['image_url'] ? receivedFriendRequest['image_url'] : '/images/profile_placeholder.png'} />
                            <div><Link to={'/user/' + receivedFriendRequest.id}>{receivedFriendRequest['first_name']} {receivedFriendRequest['last_name']}</Link></div>
                        </Link>
                        <Link className='friend-button' onClick={this.acceptFriendRequest} id={receivedFriendRequest['sender_id']}>
                            Accept Friend Request
                        </Link>
                    </div>
                );
            });
        }

        if (this.state.sentFriendRequests) {
            sentFriendRequests = this.state.sentFriendRequests.map((sentFriendRequest) => {
                return (
                    <div className='friend-request-sent' key={sentFriendRequest.id}>
                        <Link to={'/user/' + sentFriendRequest['recipient_id']}>
                            <img src={sentFriendRequest['image_url'] ? sentFriendRequest['image_url'] : '/images/profile_placeholder.png'} />
                            <div><Link to={'/user/' + sentFriendRequest.id}>{sentFriendRequest['first_name']} {sentFriendRequest['last_name']}</Link></div>
                        </Link>
                        <Link className='friend-button' onClick={this.cancelFriendRequest} id={sentFriendRequest['recipient_id']}>
                            Cancel Friend Request
                        </Link>
                    </div>
                );
            });
        }

        if (this.state.friends) {
            // console.log(this.state.friends);
            friends = this.state.friends.map((friend) => {
                return (
                    <div className='friend' key={friend.id}>
                        <Link to={'/user/' + friend.id}>
                        <img src={friend['image_url'] ? friend['image_url'] : '/images/profile_placeholder.png'} />
                        <div>{friend['first_name']} {friend['last_name']}</div>
                        </Link>
                        <Link className='friend-button' onClick={this.unfriend} id={friend.id}>
                            Unfriend
                        </Link>
                    </div>
                );
            });
        }

        return (
                <div id='friends-wrapper'>
                    {/* {receivedFriendRequests.length != 0 || sentFriendRequests.length != 0 || friends.length != 0 && */}
                    {receivedFriendRequests.length != 0 && <div id='friend-requests'>
                        Friend Requests
                        {receivedFriendRequests}
                    </div>}
                    {sentFriendRequests.length != 0 && <div id='friend-requests-sent'>
                        Friend Requests Sent
                        {sentFriendRequests}
                    </div>}
                    {friends.length != 0 && <div id='friends'>
                        Friends
                        {friends}
                    </div>}
                </div>
        );
    }
}
