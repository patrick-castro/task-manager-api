const sgMail = require('@sendgrid/mail');
const sendgridAPIKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendgridAPIKey);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'castropatrickantonio@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with app.`,
    });
};

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'castropatrickantonio@gmail.com',
        subject: 'Sorry to see you go!',
        text: `We would like to know why you deleted your account, ${name}. Send us a message.`,
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail,
};
