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

    const allowed = [
      'image/png',
      'image/jpeg',
      'image/webp',
    ];

    if (image.type && !allowed.includes(image.type)) {
      return Response.json(
        { error: 'Use uma imagem PNG, JPG ou WebP.' },
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
        'Photoroom:',
        response.status,
        message
      );

      return Response.json(
        {
          error: 'Não foi possível separar a imagem.',
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
    console.error('Separate API:', error);

    return Response.json(
      { error: 'Erro interno ao processar a imagem.' },
      { status: 500 }
    );
  }
}
