import { MailtrapClient } from 'mailtrap';

const mailTrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});
export const sendWelcomeEmail = (email, name, token) => {
  const sender = {
    name: 'Wolf App Team',
    email: 'wencelfabiansantos@gmail.com',
  };

  mailTrapClient
    .send({
      from: sender,
      to: [{ email }],
      subject: 'Activa tu cuenta',
      text: `Hola ${name}, por favor activa tu cuenta haciendo click en ${process.env.WEB_URL}/api/users/activate/${token}`,
      html: `<strong>Hola ${name}, por favor activa tu cuenta haciendo click
       <a href="${process.env.WEB_URL}/api/users/activate/${token}" noopener noreferrer >aca</a> </strong>`,
    })
    .then(console.log)
    .catch(console.error);
};

export const sendCancelationEmail = (email, name) => {
  const msg = {
    to: email,
    from: 'wencelfabiansantos@gmail.com',
    subject: 'Sorry to see you go',
    text: `Hi ${name}, we are sorry to see you go, please let us know
     if there is anything we could have done to make you stay`,
    html: `<strong>Hi ${name}, we are sorry to see you go, please let us know
    if there is anything we could have done to make you stay</strong>`,
  };
  mailTrapClient
    .send({
      from: sender,
      to: [{ email }],
      subject: 'Activa tu cuenta',
      text: `Hi ${name}, we are sorry to see you go, please let us know
     if there is anything we could have done to make you stay`,
      html: `<strong>Hi ${name}, we are sorry to see you go, please let us know
    if there is anything we could have done to make you stay</strong>`,
    })
    .then(console.log)
    .catch(console.error);
};
