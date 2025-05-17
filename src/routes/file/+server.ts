import type {RequestEvent, RequestHandler} from './$types';

/**
 * @description this is just test route for file uploads
 * @param {RequestEvent} request
 * @return void
 */
export const POST: RequestHandler = async ({ request }: RequestEvent) : Promise <Response> => {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
        return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
    }
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};