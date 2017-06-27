import React from 'react';

export default class Welcome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
                <div>
                    <img src='/images/logo.png' />
                    {this.props.children}
                </div>
        );
    }
}
