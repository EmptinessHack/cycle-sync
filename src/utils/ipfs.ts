/**
 * Módulo para subir archivos cifrados a IPFS usando Pinata
 * 
 * Este módulo se encarga exclusivamente de subir datos cifrados a IPFS
 * mediante el servicio Pinata usando el SDK oficial.
 */

import { PinataSDK } from 'pinata';

export interface IPFSUploadInput {
  ciphertext: string; // base64
  iv: string; // base64
  tag: string; // base64
}

export interface IPFSUploadResult {
  cid: string;
  size: number; // tamaño en bytes
}

/**
 * Configuración de Pinata desde variables de entorno
 * Se usa JWT (método recomendado)
 */
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT?.trim() || '';
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY?.trim() || '';

/**
 * Sube un archivo JSON cifrado a IPFS usando Pinata
 * 
 * @param input - Objeto con ciphertext, iv y tag en base64
 * @returns Objeto con CID y tamaño del archivo
 */
export async function uploadToIPFS(
  input: IPFSUploadInput
): Promise<IPFSUploadResult> {
  try {
    // 1. Validar que el JWT esté configurado
    if (!PINATA_JWT) {
      throw new Error(
        'Pinata JWT not configured. Set VITE_PINATA_JWT in your environment variables.'
      );
    }

    // 2. Crear el objeto JSON con los datos cifrados
    const encryptedData = {
      ciphertext: input.ciphertext,
      iv: input.iv,
      tag: input.tag,
    };

    // 3. Convertir a JSON string y crear Blob
    const jsonString = JSON.stringify(encryptedData);
    const jsonBlob = new Blob([jsonString], { type: 'application/json' });

    // 4. Inicializar el SDK de Pinata
    const pinata = new PinataSDK({
      pinataJwt: PINATA_JWT,
      ...(PINATA_GATEWAY && { pinataGateway: PINATA_GATEWAY }),
    });

    // 5. Crear un File desde el Blob para el SDK
    const file = new File([jsonBlob], 'encrypted-data.json', {
      type: 'application/json',
    });

    // 6. Subir a Pinata usando el SDK (subida pública)
    const result = await pinata.upload.public.file(file);

    // 7. Retornar CID y tamaño
    return {
      cid: result.cid || '',
      size: result.size || jsonBlob.size,
    };
  } catch (error) {
    throw new Error(
      `Error al subir a IPFS: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
}

