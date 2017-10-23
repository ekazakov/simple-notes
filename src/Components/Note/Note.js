import './Note.css';
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import get from 'lodash/get';
import format from 'date-fns/format'
import DeleteNoteMutation from '../../Mutations/DeleteNoteMutation';
import UpdateNoteMutation from '../../Mutations/UpdateNoteMutation';

function Initials({ name }) {
    const initials = name
        .split(' ')
        .map(word => word[0].toUpperCase())
        .join('')
    ;
    return (<span className="Initials">{initials}</span>);
}

class Note extends Component {
    state = {
        editModeOn: false,
        noteText: '',
        error: null,
    };

    onDelete = () => {
        const {
            note,
            viewerId,
        } = this.props;
        DeleteNoteMutation.commit({
            noteId: note.id,
            viewerId,
            onError: (errors) => console.warn('Not implemented yet'),
        })
    };

    onEdit = (errors) => {
        this.setState({
            editModeOn: true,
            noteText: this.props.note.text,
            error: get(errors, '0.message'),
        });
    };

    onCancel = () => {
        this.setState({ editModeOn: false, noteText: '', error: null });
    };

    onUpdateError = (errors) => {
        this.onEdit(errors);
        console.warn('Not implemented yet');
    };

    onUpdate = () => {
        const {
            note: {
                id,
            }
        } = this.props;
        const text = this.state.noteText;
        this.setState({ editModeOn: false, noteText: '', error: null });
        const timeStamp = Date.now();
        UpdateNoteMutation.commit({ id, text, timeStamp, onError: this.onUpdateError });
    };

    onNoteTextChange = ({ target: { value }}) => {
        this.setState({ noteText: value, error: null });
    };

    renderEditMode() {
        const { noteText, error } = this.state;
        return (<div className="Note__EditMode">
            <div>
                <input
                    className="Note__TextInput"
                    type="text"
                    value={noteText}
                    onChange={this.onNoteTextChange}
                />
            </div>
            {error !== null && <div className="Note__Error">{error}</div>}
            <div className="Note__Buttons">
                <button
                    type="button"
                    onClick={this.onCancel}
                    className="Note__Button Note__CancelButton"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={this.onUpdate}
                    className="Note__Button Note__SaveButton"
                >
                    Save Changes
                </button>
            </div>
        </div>);
    }

    renderViewMode() {
        const {
            userName,
            note,
        } = this.props;

        return (<div className="Note__ViewMode">
            <div className="Note__MessageWithAvatar">
                <Initials name={userName} />
                <div className="Note__Message">{note.text}</div>
            </div>
            <div className="Note__TimeStamp">
                {format(Number(note.timeStamp), 'MMM D, YYYY HH:mm')}
            </div>
            <div className="Note__Buttons">
                <button
                    type="button"
                    className="Note__Button Note__EditButton"
                    onClick={this.onEdit}
                >
                    Edit
                </button>
                <button
                    type="button"
                    className="Note__Button Note__DeleteButton"
                    onClick={this.onDelete}
                >
                    Delete
                </button>
            </div>
        </div>);
    }

    render () {
        const { editModeOn } = this.state;
        const { note } = this.props;

        return (
            <div className="Note" data-test-id={note.id}>
                {editModeOn ? this.renderEditMode() : this.renderViewMode()}
            </div>
        );
    }

}

export default createFragmentContainer(Note, graphql`
    fragment Note_note on Note {
        id
        text
        timeStamp
    }
`);
