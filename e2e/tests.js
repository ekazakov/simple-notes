const chromedriver = require('chromedriver');

let testNoteId = null;

function getElementsTestId(selector, client, done) {
    return new Promise((resolve) => {
        client.element('css selector', selector, function({ value }) {
            client.elementIdAttribute(value.ELEMENT, 'data-test-id', ({ value }) => {
                resolve(value);
                done();
            });
        })
    });
}

module.exports = {
    before: (browser, done) => {
        testNoteId = null;
        chromedriver.start();
        done();
    },

    beforeEach: (browser) => {
        browser
            .url('http://localhost:3000')
            .waitForElementVisible('body')
            .waitForElementVisible('#root > div');
    },

    'Smoke test': (browser) => {
        browser
            .assert.visible('#root > div', 'Check if app has rendered with React')
            .assert.title('Simple Relay note taking app');
    },

    'Add note': (browser) => {
        const message = `New note ${Date.now()}`;
        browser
            .assert.visible('.NewNoteForm .NewNoteForm__Input', 'Check if note form rendered')
            .setValue('.NewNoteForm__Input', message)
            .submitForm('.NewNoteForm__Form')
            .pause(500)
            .assert.containsText('.Note:last-child .Note__Message', message)
            .perform((client, done) => {
                getElementsTestId('.Note:last-child', client, done)
                    .then((id) => testNoteId = id)
                ;
            })
            .end()
        ;
    },

    'Delete note': (browser) => {
        const selector = `.Note[data-test-id="${testNoteId}"]`;
        browser
            .assert.elementPresent(selector, 'Check if some note exists')
            .moveToElement(selector, 10, 10)
            .click(`${selector} .Note__DeleteButton`)
            .pause(500)
            .assert.elementNotPresent(selector)
            .end()
        ;
    },

    after: (browser, done) => {
        browser.end();
        chromedriver.stop();
        done();
    },
};