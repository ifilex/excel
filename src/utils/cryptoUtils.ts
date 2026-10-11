/**
 * Secure AES-GCM 256-bit document encryption & decryption utility using Web Crypto API
 */

export interface EncryptedPayload {
  ciphertext: string; // Base64
  salt: string; // Base64
  iv: string; // Base64
  hint?: string;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptDocument(
  data: string | object,
  password: string,
  hint?: string
): Promise<EncryptedPayload> {
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(jsonStr);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(password, salt);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    plaintext
  );

  return {
    ciphertext: bufferToBase64(ciphertextBuffer),
    salt: bufferToBase64(salt.buffer),
    iv: bufferToBase64(iv.buffer),
    hint,
  };
}

export async function decryptDocument(
  payload: EncryptedPayload,
  password: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const salt = new Uint8Array(base64ToBuffer(payload.salt));
    const iv = new Uint8Array(base64ToBuffer(payload.iv));
    const ciphertext = base64ToBuffer(payload.ciphertext);

    const key = await deriveKey(password, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(decryptedBuffer);
    const data = JSON.parse(jsonStr);

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: 'Contraseña incorrecta o documento corrupto.',
    };
  }
}
