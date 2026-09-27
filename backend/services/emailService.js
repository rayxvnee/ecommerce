const sendEmail = async ({ to, subject, text, html }) => {
    if (!to) return;

    const hasSmtpConfig =
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS;

    if (!hasSmtpConfig) {
        console.log('📧 [Email fallback]');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Text:', text);
        return;
    }

    let nodemailer;
    try {
        nodemailer = require('nodemailer');
    } catch {
        console.log('⚠️ nodemailer not installed, using fallback log');
        console.log('📧 To:', to, 'Subject:', subject);
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@dzshop.local',
        to,
        subject,
        text,
        html,
    });
};

const sendWelcomeEmail = async ({ name, email }) => {
    await sendEmail({
        to: email,
        subject: 'Bienvenue sur DZShop',
        text: `Bonjour ${name}, bienvenue sur DZShop !`,
    });
};

const sendOrderEmail = async ({ email, name, orderId, totalPrice }) => {
    await sendEmail({
        to: email,
        subject: 'Confirmation de commande',
        text: `Bonjour ${name}, votre commande #${String(orderId).slice(-8).toUpperCase()} est confirmée. Total: $${Number(totalPrice || 0).toFixed(2)}.`,
    });
};

module.exports = {
    sendWelcomeEmail,
    sendOrderEmail,
};
