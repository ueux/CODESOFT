import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

const renderEmailTemplate = async (templateName: string, data: Record<string,any>): Promise<string> => {
    const templatePath = path.join(process.cwd(),"auth-service","src","utils","email-templates", `${templateName}.ejs`);
    return ejs.renderFile(templatePath, data);
}

export const sendEmail = async (to: string, subject: string, templateName: string, data: Record<string, any>) => {
    try {
        const html = await renderEmailTemplate(templateName, data);
        const mailOptions = {
            from: `<${process.env.SMTP_USER}>`, // Use the SMTP user as the sender
            to,
            subject,
            html,
        };

        await transporter.sendMail(mailOptions);
        return true; // Return true if email sent successfully
    } catch (error) {
        console.error('Error sending email:', error);
        return false; // Return false if there was an error
    }
};