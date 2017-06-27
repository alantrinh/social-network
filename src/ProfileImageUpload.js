import React from 'react';
import axios from './axios';

export default class ProfileImageUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.uploadProfileImage = this.uploadProfileImage.bind(this);
        this.deleteProfileImage = this.deleteProfileImage.bind(this);
        this.logOut = this.logOut.bind(this);
    }

    uploadProfileImage(e) {
        var formData = new FormData();
        formData.append('file', e.target.files[0]);

        axios.post('/uploadProfileImage', formData).then((resp) => {
            this.props.setImage(resp.data.imageUrl);
            this.props.showProfileImageUpload();
        }).catch((err) => {
            console.log(err);
        });

    }

    deleteProfileImage() {
        axios.post('/deleteProfileImage').then(() => {
            this.props.setImage('/images/profile_placeholder.png');
            this.props.showProfileImageUpload();
        }).catch((err) => {
            console.log(err);
        });
    }

    logOut() {
        axios.get('/logOut').then(() => {
            location.href = '/welcome';
        });
    }

    render() {
        return (
            <div className='profile-image-upload'>
                <ul>
                    <li><label htmlFor='profile-image-input'>Upload Profile Image</label><input type='file' id='profile-image-input' onChange={this.uploadProfileImage} /></li>
                    <li><span id='profile-image-delete-button' onClick={this.deleteProfileImage}>Delete Profile Image</span><br /></li>
                    <li><span id='logout-button' onClick={this.logOut}>Log Out</span></li>
                </ul>
            </div>
        );
    }
}
