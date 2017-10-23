import './App.css';
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { graphql, QueryRenderer } from 'react-relay';
import environment from '../../Environment';
import NotesCollection from '../NotesCollection/NotesCollection';
import NewNoteForm from '../NewNoteForm/NewNoteForm';
import Header from '../Header/Header';

const AppAllNotesQuery = graphql`
    query AppAllNotesQuery {
        viewer {
            id
            totalCount
            ...NotesCollection_viewer
        }
    }
`;

class App extends Component {
    notesRef = (node) => this.notesCollection = node;

    onNewItemAdded = () => {
        const node = findDOMNode(this.notesCollection);
        node.scrollTo(0, node.scrollHeight)
    };

    render() {
        const render = ({ error: errors, props }) => {
            if (errors) {
                return <div>{errors[0].message}</div>
            } else if (props) {
                return <div className="AppLayout">
                    <Header
                        className="AppLayout__Header"
                        viewer={props.viewer}
                    />
                    <div className="AppLayout__NotesContainer">
                        <NotesCollection ref={this.notesRef} viewer={props.viewer} />
                    </div>
                    <div className="AppLayout__NewNoteContainer">
                        <NewNoteForm
                            onNewItemAdded={this.onNewItemAdded}
                            viewer={props.viewer} />
                    </div>
                </div>;
            }
            return <div>Loading...</div>
        };

        return (
            <QueryRenderer
                environment={environment}
                query={AppAllNotesQuery}
                render={render}
            />
        );
    }
}

export default App;
