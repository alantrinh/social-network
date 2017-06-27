import React from 'react';
import axios from './axios';
import {getSocket} from './Socket';
import {Link} from 'react-router';
const socket = getSocket();

export default class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        axios.get('/chatMessages').then((resp) => {
            this.setState(resp.data);
            socket.on('updateChat', (chatMessages) => {
                this.setState({chatMessages});
            });
        });
    }

    handleChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    handleSubmit(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            if (this.state.message != '') {
                const messageData = {
                    id: this.props.id,
                    firstName: this.props.firstName,
                    lastName: this.props.lastName,
                    imageUrl: this.props.imageUrl,
                    date: new Date().toLocaleString(),
                    message: this.state.message
                };
                socket.emit('chat', messageData);
                this.setState({
                    message: ''
                });
            } else {
                return;
            }
        }
    }

    render() {
        let chatMessages = '';
        let placeholderText = '';

        if (this.state.chatMessages) {
            chatMessages = this.state.chatMessages.map((chatMessage) => {
                return (
                    <div className='chat-message-wrapper'>
                        <Link to={'/user/' + chatMessage.id}>
                        <img src={chatMessage.imageUrl} />
                        </Link>
                        <div className='chat-message'>
                            <span className='chat-name'>{chatMessage.firstName} {chatMessage.lastName}</span><span className='chat-date'> {chatMessage.date}</span><br />
                            {chatMessage.message}
                        </div>
                    </div>
                );
            });
        }
        chatMessages.length == 0 ? placeholderText = 'start a chat' : placeholderText = 'respond here';

        return (
            <div id='chat-wrapper'>
                {chatMessages}
                <div>
                    <textarea id='chat-input' name='message' value={this.state.message} onChange={this.handleChange} onKeyDown={this.handleSubmit} placeholder={placeholderText} />
                </div>
            </div>
        );
    }
}
