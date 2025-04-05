import nodemailer from 'nodemailer';
import winston from 'winston';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Creates and exports a Winston logger instance configured with:
 * - Log level set to "debug".
 * - JSON format for log messages.
 * - Console transport for outputting logs to the console.
 *
 * This logger can be used throughout the application for consistent logging.
 */
export const logger = winston.createLogger({
    level : "debug",
    format : winston.format.json(),
    transports : [new winston.transports.Console()],
});

/**
 * Sends an email using the specified parameters and SMTP configuration.
 *
 * @param to - The recipient's email address.
 * @param from - The sender's email address.
 * @param subject - The subject of the email.
 * @param htmlTemplate - The HTML content of the email.
 * 
 * @remarks
 * This function uses the `nodemailer` library to send emails. Ensure that the
 * following environment variables are set for SMTP configuration:
 * - `SMTP_HOST`: The SMTP server host.
 * - `SMTP_PORT`: The SMTP server port.
 * - `SMTP_USER`: The SMTP username.
 * - `SMTP_PASS`: The SMTP password.
 * 
 * @throws Will log an error if the email fails to send.
 * 
 * @example
 * ```typescript
 * await sendMail(
 *   'recipient@example.com',
 *   'sender@example.com',
 *   'Welcome!',
 *   '<h1>Hello, World!</h1>'
 * );
 * ```
 */
export const sendMail = async (to : string , from  : string, subject : string, htmlTemplate : string) => {
    
    const transport = nodemailer.createTransport({
        host : process.env.SMTP_HOST,
        port : Number(process.env.SMTP_PORT),
        secure : false,
        auth : {
            user : process.env.SMTP_USER,
            pass : process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from : from,
        to : to,
        subject : subject,
        html : htmlTemplate,
    };

    logger.debug(`Sending email to ${to} with subject "${subject}"`);
    await transport.sendMail(mailOptions, (error, info) => {
        if(error) {
            logger.error(`Error sending email: ${error}`);
            return;
        }
        logger.info(`Email sent: ${info.response}`);
    });
}