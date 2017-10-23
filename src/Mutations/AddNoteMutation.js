import noop from 'lodash/noop';
import {
    graphql,
    commitMutation,
} from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import environment from '../Environment';

const mutation = graphql`
    mutation AddNoteMutation($input: AddNoteInput!) {
        addNote(input: $input) {
            noteEdge {
                cursor
                node {
                    id
                    text
                    timeStamp
                }
            }
            viewer {
                id
                totalCount
            }
        }
    }
`;

let tempId = 0;

function sharedUpdater(store, viewerId, newEdge) {
    const viewerProxy = store.get(viewerId);
    const conn = ConnectionHandler.getConnection(
        viewerProxy,
        'NotesCollection_allNotes',
    );
    ConnectionHandler.insertEdgeAfter(conn, newEdge);
}

function commit({ text, viewerId, timeStamp, onCompleted = noop, onError = noop } = {}) {
    const variables = {
        input: {
            text,
            timeStamp: String(timeStamp),
        },
    };

    commitMutation(environment, {
        mutation,
        variables,

        optimisticUpdater: (proxyStore) => {
            if (text === '') {
                return;
            }

            const id = `client:newNote:${tempId++}`;
            const newNote = proxyStore.create(id, 'Note');
            newNote.setValue(text, 'text');
            newNote.setValue(timeStamp, 'timeStamp');
            newNote.setValue(id, 'id');

            const newEdge = proxyStore.create(`client:newEdge:${tempId++}`, 'NoteEdge');
            newEdge.setLinkedRecord(newNote, 'node');
            sharedUpdater(proxyStore, viewerId, newEdge);

            const viewerProxy = proxyStore.get(viewerId);
            viewerProxy.setValue(viewerProxy.getValue('totalCount') + 1, 'totalCount');
        },

        updater: (proxyStore) => {
            const payload = proxyStore.getRootField('addNote');

            if (payload) {
                const newEdge = payload.getLinkedRecord('noteEdge');
                sharedUpdater(proxyStore, viewerId, newEdge);
            }
        },

        onCompleted: (...args) => {
            console.log('onCompleted', ...args);
            onCompleted(...args);
        },

        onError: (errors) => {
            console.log(errors);
            onError(errors);
        },
    });
}

export default { commit };