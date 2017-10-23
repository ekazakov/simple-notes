import noop from 'lodash/noop';
import {
    graphql,
    commitMutation,
} from 'react-relay';
import environment from '../Environment';

const mutation = graphql`
    mutation UpdateNoteMutation($input: UpdateNoteInput!) {
        updateNote(input: $input) {
            note {
                id
                text
                timeStamp
            }
        }
    }
`;

function commit({ id, text, timeStamp, onCompleted = noop, onError = noop } = {}) {
    const variables = {
        input: {
            id,
            text,
            timeStamp: String(timeStamp),
        },
    };

    function getOptimisticResponse(id, text, timeStamp) {
        return {
            updateNote: {
                note: {
                    id,
                    text,
                    timeStamp,
                },
            },
        };
    }

    commitMutation(environment, {
        mutation,
        variables,

        optimisticResponse: getOptimisticResponse(id, text, timeStamp),

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