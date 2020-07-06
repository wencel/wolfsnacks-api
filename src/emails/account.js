const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name, token) => {
  const msg = {
    to: email,
    from: 'wencelfabiansantos@gmail.com',
    template_id: 'd-acf2936522574bf299f2626828020efe',
    personalizations: [
      {
        to: [
          {
            email,
          },
        ],
        dynamic_template_data: {
          name,
          activationLink: `${process.env.WEB_URL}/api/users/activate/${token}`,
        },
      },
    ],
  };
  sgMail.send(msg);
};
const sendCancelationEmail = (email, name) => {
  const msg = {
    to: email,
    from: 'wencelfabiansantos@gmail.com',
    subject: 'Sorry to see you go',
    text: `Hi ${name}, we are sorry to see you go, please let us know
     if there is anything we could have done to make you stay`,
    html: `<strong>Hi ${name}, we are sorry to see you go, please let us know
    if there is anything we could have done to make you stay</strong>`,
  };
  sgMail.send(msg);
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
