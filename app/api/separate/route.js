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

    const form = new FormData();

    form.append(
      'imageFile',
      image,
      image.name || 'landing-image.png'
    );

    form.append('removeBackground', 'true');

    /*
     * SEGMENTAÇÃO DA PERSONAGEM
     * Queremos somente a pessoa humana.
     */
    form.append(
      'segmentation.mode',
      'keepSalientObject'
    );

    form.append(
      'segmentation.prompt',
      'the complete human woman, her body, face, hair, arms and clothing only'
    );

    /*
     * Tudo isso deve ficar FORA
     * da camada da personagem.
     */
    form.append(
      'segmentation.negativePrompt',
      'all text, words, letters, typography, handwriting, captions, titles, subtitles, logo, button, graphic design, graphic overlay, decorative elements, background'
    );

    form.append(
      'referenceBox',
      'originalImage'
    );

    form.append(
      'outputSize',
      'originalImage'
    );

    form.append(
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
        body: form,
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
          error: `Photoroom: ${message}`,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const result = await response.arrayBuffer();

    if (!result.byteLength) {
      return Response.json(
        {
          error: 'A Photoroom retornou uma imagem vazia.',
        },
        { status: 502 }
      );
    }

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
        error: 'Erro interno ao separar a personagem.',
      },
      { status: 500 }
    );
  }
}
