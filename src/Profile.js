import React from 'react';
import {Link} from 'react-router';
import axios from './axios';

export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showBioEditor: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.showBioEditor = this.showBioEditor.bind(this);
        this.updateBio = this.updateBio.bind(this);
    }

    handleChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    showBioEditor() {
        this.setState(prevState => ({
            showBioEditor: !prevState.showBioEditor
        }));
    }

    updateBio(e) {
        e.preventDefault();
        const bio = this.state.bio;
        axios.post('/bio', {
            bio
        }).then((resp) => {
            this.props.setBio(resp.data.bio);
            this.showBioEditor();
        }).catch((err) => {
            console.log(err);
        });
    }

    render() {
        return (
            <div id='profile-wrapper'>
                <div id='profile-contents'>
                    <img className='bio-profile-image' src={this.props.imageUrl} />
                    <div className='profile'>
                        {this.props.firstName} {this.props.lastName}
                        {this.state.showBioEditor ?
                            (<form>
                                <textarea id='bioInput' name='bio' value={this.state.bio} onChange={this.handleChange}>
                                    {this.props.bio}
                                </textarea>
                                <br />
                                <button type='submit' onClick={this.updateBio}>
                                    Save
                                </button>
                            </form>)
                            :
                            (<p>
                                {this.props.bio ? (
                                    <div className='bio-profile'>
                                        {this.props.bio}
                                        <p><button onClick={this.showBioEditor}>
                                            Edit
                                        </button></p>
                                    </div>
                                )
                                :
                                (
                                    <button onClick={this.showBioEditor}>
                                        Add your bio now
                                    </button>
                                )}
                            </p>)
                        }
                    </div>
                </div>
            </div>
        );
    }
}
