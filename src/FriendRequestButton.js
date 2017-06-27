import React from 'react';
import axios from './axios';
import {Link} from 'react-router';

export default class FriendRequestButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id
        };

        this.makeFriendRequest = this.makeFriendRequest.bind(this);
        this.cancelFriendRequest = this.cancelFriendRequest.bind(this);
        this.acceptFriendRequest = this.acceptFriendRequest.bind(this);
        this.unfriend = this.unfriend.bind(this);
    }

    componentDidMount() {
        axios.get(`/friendStatus/${this.state.id}`).then((resp) => {
            if (resp.data.friendStatus == undefined) {
                this.setState({
                    friendStatus: null
                });
            } else if (resp.data.error) {
                console.log(resp.data.errorMessage);
            } else {
                this.setState({
                    friendStatus: resp.data.friendStatus,
                    recipient: resp.data.recipient
                });
            }
        });
    }

    makeFriendRequest() {
        const friendStatus = this.state.friendStatus;
        axios.post(`/makeFriendRequest/${this.state.id}`, {friendStatus}).then((resp) => {
            if (resp.data.success) {
                this.setState({
                    friendStatus: resp.data.friendStatus,
                    recipient: resp.data.recipient
                });
            } else {
                console.log(resp.data.errorMessage);
            }
        });
    }

    cancelFriendRequest() {
        axios.post(`/cancelFriendRequest/${this.state.id}`).then((resp) => {
            if (resp.data.success) {
                this.setState({
                    friendStatus: resp.data.friendStatus
                });
            } else {
                console.log(resp.data.errorMessage);
            }
        });
    }

    acceptFriendRequest() {
        axios.post(`/acceptFriendRequest/${this.state.id}`).then((resp) => {
            if (resp.data.success) {
                this.setState({
                    friendStatus: resp.data.friendStatus
                });
            } else {
                console.log(resp.data.errorMessage);
            }
        });
    }

    unfriend() {
        axios.post(`/unfriend/${this.state.id}`).then((resp) => {
            if (resp.data.success) {
                this.setState({
                    friendStatus: resp.data.friendStatus
                });
            } else {
                console.log(resp.data.errorMessage);
            }
        });
    }

    render() {
        let label;
        let action;
        if (this.state.friendStatus == null || this.state.friendStatus == 'unfriended' || this.state.friendStatus == 'cancelled') {
            label = 'Make Friend Request';
            action = this.makeFriendRequest;
        } else if (this.state.friendStatus == 'pending' && this.state.recipient) {
            label = 'Accept Friend Request';
            action = this.acceptFriendRequest;
        } else if (this.state.friendStatus == 'pending' && !this.state.recipient) {
            label = 'Cancel Friend Request';
            action = this.cancelFriendRequest;
        } else if (this.state.friendStatus == 'accepted') {
            label = 'Unfriend';
            action = this.unfriend;
        }

        return (
            <Link onClick={action}>
                <span className='friend-button'>
                    {label}
                </span>
            </Link>
        );
    }
}
