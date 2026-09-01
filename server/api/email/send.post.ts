import { Resend } from 'resend';

interface EmailRequest {
    to: string | string[];
    subject: string;
    html: string;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<EmailRequest>(event);

    if (!body.to || !body.subject || !body.html) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required email fields',
        });
    }

    const config = useRuntimeConfig();

    if (!config.resendApiKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Resend API key is not configured',
        });
    }

    const resend = new Resend(config.resendApiKey);

    const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: body.to,
        subject: body.subject,
        html: body.html,
    });

    if (error) {
        console.error('Resend error:', error);

        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        });
    }

    return {
        success: true,
        data,
    };
});