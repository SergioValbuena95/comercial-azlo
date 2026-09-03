import { Resend } from 'resend';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/database.types';
import fs from 'node:fs';
import path from 'node:path';

interface ProjectEmailRequest {
    projectId: number;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<ProjectEmailRequest>(event);
    const projectId = Number(body.projectId);

    if (!Number.isInteger(projectId) || projectId <= 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'A valid project ID is required',
        });
    }

    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Authentication is required',
        });
    }

    const client = await serverSupabaseClient<Database>(event);
    const { data: project, error: projectError } = await client
        .from('projects')
        .select('name, email')
        .eq('id', projectId)
        .single();

    if (projectError || !project) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Project not found',
        });
    }

    if (!project.email) {
        throw createError({
            statusCode: 422,
            statusMessage: 'Project email is missing',
        });
    }

    const config = useRuntimeConfig();

    if (!config.resendApiKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Resend API key is not configured',
        });
    }

    const templatePath = path.resolve(process.cwd(), 'emails/cartera.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf-8');
    htmlContent = htmlContent.replace(/{{projectName}}/g, project.name);

    const resend = new Resend(config.resendApiKey);

    const { data, error } = await resend.emails.send({
        // from: 'ventas2@azloplay.com',
        from: 'onboarding@resend.dev',
        to: project.email,
        subject: `Actualización de proyecto: ${project.name}`,
        html: htmlContent
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
