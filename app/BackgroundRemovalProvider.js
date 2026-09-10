'use client';

export async function removerFundoGratis(file, onProgress) {
  if (!file) {
    throw new Error('Nenhuma imagem enviada.');
  }

  try {
    const mod = await import('@imgly/background-removal');

    const removeBackground =
      mod.default || mod.removeBackground;

    if (!removeBackground) {
      throw new Error(
        'Biblioteca de remoção não carregou.'
      );
    }

    const blob = await removeBackground(file, {
      device: 'cpu',
      model: 'isnet_quint8',

      output: {
        format: 'image/png',
        quality: 1,
        type: 'foreground',
      },

      progress: (key, current, total) => {
        if (!total || !onProgress) return;

        const percent = Math.round(
          (current / total) * 100
        );

        onProgress(percent, key);
      },
    });

    if (!blob || !blob.size) {
      throw new Error(
        'Não foi possível gerar a imagem transparente.'
      );
    }

    return blob;
  } catch (error) {
    console.error(
      'Erro no removedor gratuito:',
      error
    );

    throw new Error(
      error?.message ||
        'Erro ao remover o fundo.'
    );
  }
}
