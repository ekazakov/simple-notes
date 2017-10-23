import './NewNoteForm.css';
import React, { Component } from "react";
import AddNoteMutation from '../../Mutations/AddNoteMutation';

class NewNoteForm extends Component {
    state = {
        text: '',
        error: null,
    };

    onInputChange = ({ target: { value }}) => {
        this.setState({ text: value, error: null });
    };

    onSubmit = (event) => {
        event.preventDefault();
        const viewerId = this.props.viewer.id;

        const { text } = this.state;
        const timeStamp = Date.now();
        this.setState({ text: '', error: null });

        AddNoteMutation.commit({
            text: text.trim(),
            timeStamp,
            viewerId,
            onCompleted: () => {
                this.props.onNewItemAdded();
            },
            onError: (errors) => {
                this.setState({
                    error: errors[0].message,
                });
            },
        });
    };

    render () {
        const {
            text,
            error,
        } = this.state;

        return (<div className="NewNoteForm">
            <form className="NewNoteForm__Form" onSubmit={this.onSubmit}>
                <div className="NewNoteForm__InputContainer">
                    <input
                        className="NewNoteForm__Input"
                        value={text}
                        placeholder="Enter note text"
                        onChange={this.onInputChange}
                    />
                    <button
                        className="NewNoteForm__Button"
                    >
                        send
                    </button>
                </div>
                {error != null && <div className="NewNoteForm__Error">{error}</div>}
            </form>
        </div>);
    }
}

export default NewNoteForm;