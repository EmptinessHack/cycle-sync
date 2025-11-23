/**
 * Utilidades para interactuar con Oasis Sapphire
 */

import { createPublicClient, http } from 'viem';
import { sapphireTestnet, sapphireMainnet } from '../config/wagmi';

/**
 * Crea un cliente público para Oasis Sapphire Testnet
 */
export function createOasisTestnetClient() {
  return createPublicClient({
    chain: sapphireTestnet,
    transport: http(),
  });
}

/**
 * Crea un cliente público para Oasis Sapphire Mainnet
 */
export function createOasisMainnetClient() {
  return createPublicClient({
    chain: sapphireMainnet,
    transport: http(),
  });
}

/**
 * Obtiene la hora actual del bloque más reciente en Oasis
 * @param useMainnet - Si es true, usa mainnet; si es false, usa testnet
 * @returns Timestamp del bloque más reciente
 */
export async function getOasisBlockTime(useMainnet: boolean = false): Promise<Date | null> {
  try {
    const client = useMainnet 
      ? createOasisMainnetClient() 
      : createOasisTestnetClient();
    
    const blockNumber = await client.getBlockNumber();
    const block = await client.getBlock({ blockNumber });
    
    if (block && block.timestamp) {
      // Convertir timestamp (BigInt) a Date
      return new Date(Number(block.timestamp) * 1000);
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener tiempo de bloque de Oasis:', error);
    return null;
  }
}

/**
 * Obtiene información básica de la red Oasis
 * @param useMainnet - Si es true, usa mainnet; si es false, usa testnet
 * @returns Información de la red
 */
export async function getOasisNetworkInfo(useMainnet: boolean = false) {
  try {
    const client = useMainnet 
      ? createOasisMainnetClient() 
      : createOasisTestnetClient();
    
    const [blockNumber, chainId] = await Promise.all([
      client.getBlockNumber(),
      client.getChainId(),
    ]);
    
    const block = await client.getBlock({ blockNumber });
    
    return {
      chainId: Number(chainId),
      blockNumber: blockNumber.toString(),
      timestamp: block?.timestamp ? new Date(Number(block.timestamp) * 1000) : null,
      network: useMainnet ? 'Oasis Sapphire Mainnet' : 'Oasis Sapphire Testnet',
    };
  } catch (error) {
    console.error('Error al obtener información de red Oasis:', error);
    return null;
  }
}

