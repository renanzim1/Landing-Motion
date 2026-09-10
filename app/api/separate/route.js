export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const apiKey = process.env.PHOTOROOM_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error: 'PHOTOROOM_API_KEY não configurada.',
        },
        { status: 500 }
      );
    }

    const incoming = await request.formData();
    const image = incoming.get('image');

    if (!image || typeof image === 'string') {
      return Response.json(
        {
          error: 'Nenhuma imagem foi enviada.',
        },
        { status: 400 }
      );
    }

    const photoRoomForm = new FormData();

    photoRoomForm.append(
      'imageFile',
      image,
      image.name || 'landing-image.png'
    );

    /*
     * Recorte com fundo transparente.
     */
    photoRoomForm.append(
      'removeBackground',
      'true'
    );

    /*
     * SEGMENTAÇÃO DIRECIONADA
     *
     * Dizemos explicitamente o que
     * queremos manter: somente a pessoa.
     */
    photoRoomForm.append(
      'segmentation.mode',
      'keepSalientObject'
    );

    photoRoomForm.append(
      'segmentation.prompt',
      'person, woman'
    );

    /*
     * Elementos que NÃO queremos
     * junto da personagem.
     */
    photoRoomForm.append(
      'segmentation.negativePrompt',
      'text, typography, letters, words, logo, button, graphic design, background'
    );

    /*
     * Mantém tamanho e posição
     * correspondentes à arte original.
     */
    photoRoomForm.append(
      'referenceBox',
      'originalImage'
    );

    photoRoomForm.append(
      'outputSize',
      'originalImage'
    );

    /*
     * PNG mantém transparência.
     */
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

    /*
     * Se houver outro erro,
     * continuamos mostrando a mensagem
     * original da Photoroom na tela.
     */
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
        {
          status: response.status,
        }
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
      {
        status: 500,
      }
    );
  }
}
