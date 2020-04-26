// Mocks SendGrid
// This exists so that emails wont be sent to a user's account everytime the test suites run
module.exports = {
    setApiKey() {},
    send() {},
};
