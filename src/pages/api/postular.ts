import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const DESTINO = 'seleccionluchapartners@gmail.com';

export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();

    const nombres   = form.get('nombres')?.toString() ?? '';
    const apellidos = form.get('apellidos')?.toString() ?? '';
    const telefono  = form.get('telefono')?.toString() ?? '';
    const correo    = form.get('correo')?.toString() ?? '';
    const distrito  = form.get('distrito')?.toString() ?? '';
    const puesto    = form.get('puesto')?.toString() ?? '';
    const cvFile    = form.get('cv') as File | null;

    const attachments: { filename: string; content: Buffer }[] = [];

    if (cvFile && cvFile.size > 0) {
      const buffer = Buffer.from(await cvFile.arrayBuffer());
      attachments.push({ filename: cvFile.name, content: buffer });
    }

    const { error } = await resend.emails.send({
      from: 'Postulaciones Lucha Partners <onboarding@resend.dev>',
      to: DESTINO,
      subject: `Nueva postulación — ${nombres} ${apellidos}`,
      html: `
        <h2>Nueva postulación recibida</h2>
        <table>
          <tr><td><strong>Nombres:</strong></td><td>${nombres}</td></tr>
          <tr><td><strong>Apellidos:</strong></td><td>${apellidos}</td></tr>
          <tr><td><strong>Teléfono:</strong></td><td>${telefono}</td></tr>
          <tr><td><strong>Correo:</strong></td><td>${correo}</td></tr>
          <tr><td><strong>Distrito:</strong></td><td>${distrito}</td></tr>
          <tr><td><strong>Puesto:</strong></td><td>${puesto}</td></tr>
        </table>
        ${cvFile && cvFile.size > 0 ? '<p>CV adjunto al correo.</p>' : '<p>No se adjuntó CV.</p>'}
      `,
      attachments,
    });

    if (error) {
      return new Response(JSON.stringify({ ok: false, message: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    return new Response(JSON.stringify({ ok: false, message: msg }), { status: 500 });
  }
};
