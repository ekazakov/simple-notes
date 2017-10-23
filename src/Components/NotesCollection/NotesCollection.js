import './NotesCollection.css';
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import isEmpty from 'lodash/isEmpty';
import Note from '../Note/Note';

class NotesCollection extends Component {
    render() {
        const {
            allNotes,
            name,
            id,
        } = this.props.viewer;


        return (
            <div className="NotesCollection">
                {isEmpty(allNotes.edges) &&
                <div className="NotesCollection__EmptyMessage">You have no any notes yet. Add something :)</div>}
                <div className="NotesCollection__Container">
                    {allNotes.edges.map(({ node }) =>
                        <Note
                            key={node.id}
                            note={node}
                            viewerId={id}
                            userName={name}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default createFragmentContainer(NotesCollection, graphql`
    fragment NotesCollection_viewer on User {
        totalCount
        allNotes(last: 10000) @connection(key: "NotesCollection_allNotes") {
            edges {
                node {
                    id
                    text
                    ...Note_note
                }
            }
        }
        id
        name
    }
`);
