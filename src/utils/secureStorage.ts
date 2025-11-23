/**
 * Módulo de almacenamiento seguro usando encriptación + IPFS
 * 
 * Este módulo integra la encriptación y el almacenamiento en IPFS
 * para guardar datos del usuario de forma segura.
 */

import { UserData } from '../types';
import { encryptUserData, EncryptionInput, EncryptionResult } from './encryption';
import { uploadToIPFS, IPFSUploadInput } from './ipfs';
import { logEncryptionData, validateEncryptionData, analyzeUserDataFields } from './debugEncryption';

/**
 * Interfaz para el resultado del guardado seguro
 */
export interface SecureStorageResult {
  cid: string;
  size: number;
  aesKey: string; // Esta debe ser cifrada por el backend antes de guardarse
}

/**
 * Interfaz para los metadatos que se guardan localmente o en backend
 */
export interface UserIPFSMetadata {
  userId: string;
  ipfsCid: string;
  aesKeyEncrypted?: string; // Clave AES cifrada (solo si se guarda en backend)
  size: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Guarda los datos del usuario de forma segura usando encriptación + IPFS
 * 
 * @param userId - ID del usuario (Privy User ID)
 * @param userData - Datos del usuario a guardar
 * @param aiPrompt - Prompt completo para el agente de IA
 * @returns Resultado con CID, tamaño y clave AES
 */
export async function saveUserDataSecurely(
  userId: string,
  userData: UserData,
  aiPrompt: string,
  debug: boolean = false
): Promise<SecureStorageResult> {
  try {
    // 0. Validar y mostrar datos (solo si debug está activado)
    if (debug) {
      const validation = validateEncryptionData(userData, aiPrompt);
      if (!validation.valid) {
        console.warn('⚠️ Errores de validación:', validation.errors);
      }
      analyzeUserDataFields(userData);
      logEncryptionData({ userId, userData, aiPrompt });
    }

    // 1. Encriptar los datos
    const encryptionInput: EncryptionInput = {
      userId,
      userData,
      aiPrompt,
    };

    const encrypted: EncryptionResult = await encryptUserData(encryptionInput);

    // 2. Subir a IPFS (solo datos cifrados, sin la clave)
    const ipfsInput: IPFSUploadInput = {
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      tag: encrypted.tag,
    };

    const ipfsResult = await uploadToIPFS(ipfsInput);

    // 3. Retornar resultado
    return {
      cid: ipfsResult.cid,
      size: ipfsResult.size,
      aesKey: encrypted.aesKey, // ⚠️ Esta clave debe ser cifrada por el backend
    };
  } catch (error) {
    throw new Error(
      `Error al guardar datos de forma segura: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
}

/**
 * Guarda los metadatos del CID en localStorage (solo para desarrollo)
 * En producción, esto debe ir al backend
 * 
 * @param userId - ID del usuario
 * @param cid - CID de IPFS
 * @param size - Tamaño del archivo
 */
export function saveIPFSMetadataLocally(
  userId: string,
  cid: string,
  size: number
): void {
  try {
    const metadata: UserIPFSMetadata = {
      userId,
      ipfsCid: cid,
      size,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Guardar en localStorage con clave única por usuario
    const storageKey = `ipfs-metadata-${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(metadata));
  } catch (error) {
    console.error('Error al guardar metadatos de IPFS:', error);
  }
}

/**
 * Obtiene los metadatos de IPFS desde localStorage
 * 
 * @param userId - ID del usuario
 * @returns Metadatos de IPFS o null si no existen
 */
export function getIPFSMetadataLocally(userId: string): UserIPFSMetadata | null {
  try {
    const storageKey = `ipfs-metadata-${userId}`;
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error al obtener metadatos de IPFS:', error);
    return null;
  }
}

/**
 * Función completa que guarda datos y metadatos
 * 
 * @param userId - ID del usuario
 * @param userData - Datos del usuario
 * @param aiPrompt - Prompt para IA
 * @param saveMetadata - Si true, guarda metadatos en localStorage (default: true)
 * @returns Resultado con CID y tamaño
 */
export async function saveUserDataComplete(
  userId: string,
  userData: UserData,
  aiPrompt: string,
  saveMetadata: boolean = true
): Promise<SecureStorageResult> {
  // 1. Guardar datos de forma segura
  const result = await saveUserDataSecurely(userId, userData, aiPrompt);

  // 2. Guardar metadatos localmente (si se solicita)
  if (saveMetadata) {
    saveIPFSMetadataLocally(userId, result.cid, result.size);
  }

  // 3. ⚠️ IMPORTANTE: En producción, aquí debes enviar al backend:
  // await sendToBackend({
  //   userId,
  //   ipfsCid: result.cid,
  //   aesKeyEncrypted: await encryptAESKeyForBackend(result.aesKey),
  //   size: result.size
  // });

  return result;
}

/**
 * Ejemplo de cómo enviar datos al backend
 * (Esta función debe ser implementada según tu backend)
 */
export async function sendToBackend(metadata: {
  userId: string;
  ipfsCid: string;
  aesKeyEncrypted: string; // Clave AES cifrada por el backend
  size: number;
}): Promise<void> {
  // TODO: Implementar llamada al backend
  // Ejemplo:
  // const response = await fetch('/api/user-data', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(metadata)
  // });
  // if (!response.ok) throw new Error('Error al guardar en backend');
  
  console.log('⚠️ Backend no implementado. Datos:', metadata);
}

