import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const TOKEN_FILE = path.join(process.cwd(), 'ideasoft-tokens.json');
const ATLAS_URI = process.env.OLD_MONGODB_URI;

export interface IdeasoftToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  updatedAt?: string;
}

/**
 * Atlas DB'den en güncel Ideasoft tokenlarını çeker ve yerel dosyaya kaydeder.
 * Bu işlem sadece geliştirme ortamında (Dev Mode) kullanılmalıdır.
 */
export async function syncTokensFromAtlas(): Promise<IdeasoftToken> {
  if (!ATLAS_URI) {
    throw new Error('OLD_MONGODB_URI ortam değişkeni tanımlanmamış. Lütfen .env.local dosyasını kontrol edin.');
  }
  console.log('Ideasoft tokenları Atlas\'tan senkronize ediliyor...');
  
  let atlasConn;
  try {
    atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    
    // Atlas'taki 'tokens' koleksiyonuna bağlan
    const TokenAtlas = atlasConn.model('Token', new mongoose.Schema({}, { strict: false }), 'tokens');
    
    const atlasTokens = await TokenAtlas.find({}).lean();
    
    if (!atlasTokens || atlasTokens.length === 0) {
      throw new Error('Atlas DB üzerinde herhangi bir token bulunamadı.');
    }
    
    const latestToken = atlasTokens[0] as any;
    
    const tokenData: IdeasoftToken = {
      accessToken: latestToken.accessToken,
      refreshToken: latestToken.refreshToken,
      expiresIn: latestToken.expiresIn || 3600,
      updatedAt: new Date().toISOString()
    };
    
    // Yerel dosyaya kaydet
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2));
    console.log('Tokenlar başarıyla senkronize edildi ve ideasoft-tokens.json dosyasına kaydedildi.');
    
    return tokenData;
  } catch (error) {
    console.error('Atlas\'tan token senkronizasyonu sırasında hata oluştu:', error);
    throw error;
  } finally {
    if (atlasConn) {
      await atlasConn.close();
    }
  }
}

/**
 * Yerel dosyadaki tokenları okur.
 */
export function getLocalTokens(): IdeasoftToken | null {
  if (!fs.existsSync(TOKEN_FILE)) {
    return null;
  }
  
  try {
    const data = fs.readFileSync(TOKEN_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Yerel tokenlar okunurken hata oluştu:', error);
    return null;
  }
}

/**
 * Tokenları yerel dosyaya kaydeder.
 */
export function saveLocalTokens(tokens: IdeasoftToken): void {
  try {
    const data = {
      ...tokens,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Tokenlar kaydedilirken hata oluştu:', error);
  }
}
