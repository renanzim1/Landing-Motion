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

    /*
     * 1. REMOVE TEXTOS ADICIONADOS
     * NA ARTE.
     *
     * Isso inclui títulos, chamadas,
     * botões e tipografias inseridas
     * na composição.
     */
    form.append(
      'textRemoval.mode',
      'ai.artificial'
    );

    /*
     * 2. REMOVE O FUNDO.
     */
    form.append(
      'removeBackground',
      'true'
    );

    /*
     * 3. MANTÉM SOMENTE A PESSOA.
     */
    form.append(
      'segmentation.mode',
      'keepSalientObject'
    );

    form.append(
      'segmentation.prompt',
      'the complete human woman including face, hair, body, arms, hands and clothing'
    );

    form.append(
      'segmentation.negativePrompt',
      'text, letters, words, typography, title, subtitle, logo, button, graphic overlay, background'
    );

    /*
     * Mantém o enquadramento original.
     */
    form.append(
      'referenceBox',
      'originalImage'
    );

    form.append(
      'outputSize',
      'originalImage'
    );

    /*
     * PNG transparente.
     */
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
        'Photoroom error:',
        response.status,
        message
      );

      return Response.json(
        {
          error: `Photoroom: ${message}`,
          status: response.status,
        },
        {
          status: response.status,
        }
      );
    }

    const result =
      await response.arrayBuffer();

    if (!result.byteLength) {
      return Response.json(
        {
          error:
            'A Photoroom retornou uma imagem vazia.',
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
        error:
          'Erro interno ao processar a personagem.',
      },
      { status: 500 }
    );
  }
}
