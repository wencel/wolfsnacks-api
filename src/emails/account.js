import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,       // your gmail (e.g. you@gmail.com)
    pass: process.env.GMAIL_APP_PASS,   // your 16-char app password
  },
});

export const sendWelcomeEmail = async (to, name, token) => {
  const mailOptions = {
    from: `Wolf App Team <${process.env.GMAIL_USER}>`,
    to,
    subject: "Activa tu cuenta de Wolfsnacks",
    html: `<strong>Hola ${name}, por favor activa tu cuenta haciendo click
       <a href="${process.env.WEB_URL}/activate/${token}" target="_blank" rel="noopener noreferrer">aca</a> </strong>`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Activation email sent");
  } catch (err) {
    console.error("Email error:", err);
  }
};

export const sendCancelationEmail = async (to, name) => {
  const mailOptions = {
    from: `Wolf App Team <${process.env.GMAIL_USER}>`,
    to,
    subject: "Cancelación de cuenta de Wolfsnacks",
    html: `<strong>Hola ${name}, nos alegra que nos hayas dado la oportunidad de ser parte de tu negocio.
       Si tienes alguna pregunta, no dudes en contactarnos.`
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Cancelation email sent");
  } catch (err) {
    console.error("Email error:", err);
  }
};
