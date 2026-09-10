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

    // Remove o fundo
    photoRoomForm.append('removeBackground', 'true');

    // Mantém o objeto principal (a pessoa)
    photoRoomForm.append(
      'segmentation.mode',
      'keepSalientObject'
    );

    // Tenta excluir elementos gráficos/textuais
    photoRoomForm.append(
      'segmentation.negativePrompt',
      'text, typography, button, logo, graphic'
    );

    // Mantém o tamanho/posição da composição
    photoRoomForm.append(
      'referenceBox',
      'originalImage'
    );

    photoRoomForm.append(
      'outputSize',
      'originalImage'
    );

    photoRoomForm.append(
      'export.format',
      'png'
    );

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
        'Photoroom segmentation error:',
        response.status,
        message
      );

      return Response.json(
        {
          error:
            response.status === 402 ||
            response.status === 403
              ? 'Sua chave da Photoroom não possui acesso à segmentação avançada.'
              : 'A Photoroom não conseguiu separar somente a personagem.',
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
    console.error(
      'Separate API error:',
      error
    );

    return Response.json(
      {
        error:
          'Erro interno ao separar a personagem.',
      },
      { status: 500 }
    );
  }
}
