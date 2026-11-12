/**
 * Compressão de imagem no navegador.
 *
 * Estava embutida no AdminPanel e servia só à capa do produto. Com a galeria,
 * a mesma lógica passou a ser necessária em dois lugares com tamanhos
 * diferentes, então virou função.
 *
 * Enquanto não existe hospedagem externa de imagem, cada foto é gravada como
 * data URL em base64 dentro do Firestore. Base64 infla o arquivo em cerca de
 * 33%, e o limite do Firestore é 1 MiB por documento — por isso comprimir aqui
 * não é otimização, é o que mantém a gravação possível.
 *
 * Chamado por: components/AdminPanel.tsx.
 */

/** Capa: aparece pequena na grade, então pode ser bem reduzida. */
export const CAPA = { lado: 600, qualidade: 0.6 };

/** Foto da galeria: é vista grande, merece mais resolução. */
export const GALERIA = { lado: 1200, qualidade: 0.72 };

export function comprimirImagem(
  file: File,
  { lado, qualidade }: { lado: number; qualidade: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Esse arquivo não é uma imagem.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.onload = (evento) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Não foi possível abrir essa imagem.'));
      img.onload = () => {
        let { width, height } = img;

        // Reduz pelo maior lado, preservando a proporção.
        if (width > height && width > lado) {
          height *= lado / width;
          width = lado;
        } else if (height >= width && height > lado) {
          width *= lado / height;
          height = lado;
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Este navegador não conseguiu processar a imagem.'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // JPEG, e não PNG: foto de produto em PNG fica várias vezes maior.
        resolve(canvas.toDataURL('image/jpeg', qualidade));
      };
      img.src = evento.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
