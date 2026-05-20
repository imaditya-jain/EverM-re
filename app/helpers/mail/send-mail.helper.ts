import transporter from "../../config/nodemailer.config";

type MailType = "VERIFY_USER" | "FORGOT_PASSWORD";

interface SendMailData {
  email: string;
  name: string;
  verificationLink?: string;
}

const generateEmailTemplate = ({
  title,
  heading,
  message,
  buttonText,
  buttonColor,
  verificationLink,
  footerMessage,
}: {
  title: string;
  heading: string;
  message: string;
  buttonText: string;
  buttonColor: string;
  verificationLink: string;
  footerMessage: string;
}) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${title}</title>
  </head>

  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0; background-color:#f4f4f4;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; padding:30px;">

            <!-- Heading -->
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h2 style="margin:0; color:#333;">${heading}</h2>
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style="color:#555; font-size:16px; line-height:1.6;">
                ${message}
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align="center" style="padding:30px 0;">
                <a
                  href="${verificationLink}"
                  style="
                    background-color:${buttonColor};
                    color:#ffffff;
                    padding:14px 28px;
                    text-decoration:none;
                    border-radius:6px;
                    font-size:16px;
                    display:inline-block;
                  "
                >
                  ${buttonText}
                </a>
              </td>
            </tr>

            <!-- Fallback Link -->
            <tr>
              <td style="color:#555; font-size:14px; line-height:1.5;">
                <p>If the button above doesn’t work, copy and paste this link into your browser:</p>

                <p style="word-break:break-all; color:${buttonColor};">
                  ${verificationLink}
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding-top:30px; color:#999; font-size:12px; text-align:center;">
                <p>${footerMessage}</p>
                <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};

const sendMailHelper = async (
  type: MailType,
  data: SendMailData
): Promise<void> => {
  const { email, name, verificationLink } = data;

  let subject = "";
  let body = "";

  switch (type) {
    case "VERIFY_USER":
      if (!verificationLink) {
        throw new Error("Verification link is required.");
      }

      subject = "You're Almost In! Verify Your Email";

      body = generateEmailTemplate({
        title: "Verify Email",
        heading: "Verify Your Email",
        message: `
          <p>Hi ${name},</p>

          <p>
            Thanks for signing up! Please confirm your email address
            by clicking the button below.
          </p>
        `,
        buttonText: "Verify Email",
        buttonColor: "#4CAF50",
        verificationLink,
        footerMessage:
          "If you did not create an account, you can safely ignore this email.",
      });

      break;

    case "FORGOT_PASSWORD":
      if (!verificationLink) {
        throw new Error("Reset password link is required.");
      }

      subject = "Reset Your Password";

      body = generateEmailTemplate({
        title: "Reset Password",
        heading: "Reset Your Password",
        message: `
          <p>Hi ${name},</p>

          <p>
            We received a request to reset your password.
          </p>

          <p>
            Click the button below to create a new password.
            This link will expire in 5 minutes.
          </p>
        `,
        buttonText: "Reset Password",
        buttonColor: "#ff5722",
        verificationLink,
        footerMessage:
          "If you did not request a password reset, you can safely ignore this email.",
      });

      break;

    default:
      throw new Error("Invalid mail type.");
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html: body,
  });
};

export default sendMailHelper;