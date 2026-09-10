'use client';

import removeBackground from '@imgly/background-removal';

export async function removerFundoGratis(file, onProgress) {
  if (!file) {
    throw new Error('Nenhuma imagem enviada.');
  }

  const blob = await removeBackground(file, {
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
}
