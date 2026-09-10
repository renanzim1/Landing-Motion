export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const apiKey = process.env.PHOTOROOM_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: 'PHOTOROOM_API_KEY não configurada.' },
        { status: 500 }
      );
    }

    const incoming = await request.formData();
    const image = incoming.get('image');

    if (!image || typeof image === 'string') {
      return Response.json(
        { error: 'Nenhuma imagem foi enviada.' },
        { status: 400 }
      );
    }

    const photoRoomForm = new FormData();

    photoRoomForm.append(
      'imageFile',
      image,
      image.name || 'landing-image.png'
    );

    photoRoomForm.append('removeBackground', 'true');
    photoRoomForm.append('export.format', 'png');

    const response = await fetch(
      'https://image-api.photoroom.com/v2/edit',
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
        body: photoRoomForm,
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const message = await response.text();

      console.error(
        'Photoroom error:',
        response.status,
        message
      );

      return Response.json(
        {
          error: 'A Photoroom recusou o processamento.',
          status: response.status,
        },
        { status: response.status }
      );
    }

    const result = await response.arrayBuffer();

    return new Response(result, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Separate API error:', error);

    return Response.json(
      {
        error: 'Erro interno ao processar a imagem.',
      },
      { status: 500 }
    );
  }
}
