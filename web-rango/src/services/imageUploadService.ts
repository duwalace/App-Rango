import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot 
} from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface UploadProgress {
  progress: number;
  isUploading: boolean;
  error: string | null;
}

interface ImageUploadResult {
  url: string;
  thumbnailUrl: string;
  storageRef: string;
}

/**
 * Serviço para upload de imagens de produtos
 * Features:
 * - Validação de arquivo
 * - Compressão automática
 * - Geração de thumbnails
 * - Progress tracking
 * - Cleanup em caso de erro
 */
export class ImageUploadService {
  
  private static readonly MAX_SIZE_MB = 5;
  private static readonly MAX_SIZE_BYTES = 5 * 1024 * 1024;
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private static readonly THUMBNAIL_SIZE = 400;
  private static readonly MAX_IMAGE_SIZE = 1920;
  
  /**
   * Faz upload de imagem de produto com compressão automática
   */
  static async uploadProductImage(
    file: File,
    storeId: string,
    productId: string,
    onProgress?: (progress: number) => void
  ): Promise<ImageUploadResult> {
    
    try {
      // 1. Validação
      this.validateImageFile(file);
      
      // 2. Compressão da imagem principal
      const compressedFile = await this.compressImage(file, this.MAX_IMAGE_SIZE, 0.8);
      
      // 3. Gerar thumbnail
      const thumbnailFile = await this.compressImage(file, this.THUMBNAIL_SIZE, 0.7);
      
      // 4. Upload da imagem principal
      const timestamp = Date.now();
      const sanitizedFileName = this.sanitizeFileName(file.name);
      const imageRef = ref(
        storage, 
        `stores/${storeId}/products/${productId}/${timestamp}-${sanitizedFileName}`
      );
      
      const uploadTask = uploadBytesResumable(imageRef, compressedFile);
      
      // Tracking de progresso
      uploadTask.on('state_changed', 
        (snapshot: UploadTaskSnapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          onProgress?.(progress);
        }
      );
      
      await uploadTask;
      const url = await getDownloadURL(imageRef);
      
      // 5. Upload do thumbnail
      const thumbnailRef = ref(
        storage,
        `stores/${storeId}/products/${productId}/thumbnails/${timestamp}-thumb-${sanitizedFileName}`
      );
      
      await uploadBytesResumable(thumbnailRef, thumbnailFile);
      const thumbnailUrl = await getDownloadURL(thumbnailRef);
      
      return {
        url,
        thumbnailUrl,
        storageRef: imageRef.fullPath
      };
      
    } catch (error) {
      console.error('❌ Erro no upload de imagem:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }
  
  /**
   * Faz upload de múltiplas imagens
   */
  static async uploadMultipleImages(
    files: File[],
    storeId: string,
    productId: string,
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<ImageUploadResult[]> {
    
    const results: ImageUploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const result = await this.uploadProductImage(
          file,
          storeId,
          productId,
          (progress) => onProgress?.(i, progress)
        );
        results.push(result);
      } catch (error) {
        console.error(`Erro ao fazer upload do arquivo ${i + 1}:`, error);
        // Continua com os próximos arquivos
      }
    }
    
    return results;
  }
  
  /**
   * Deleta imagem do Storage
   */
  static async deleteProductImage(storageRef: string): Promise<void> {
    try {
      const imageRef = ref(storage, storageRef);
      await deleteObject(imageRef);
      
      // Tentar deletar thumbnail associado
      const thumbnailPath = this.getThumbnailPath(storageRef);
      if (thumbnailPath) {
        try {
          const thumbnailRef = ref(storage, thumbnailPath);
          await deleteObject(thumbnailRef);
        } catch (err) {
          console.warn('Thumbnail não encontrado ou já deletado');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao deletar imagem:', error);
      throw error;
    }
  }
  
  /**
   * Deleta múltiplas imagens
   */
  static async deleteMultipleImages(storageRefs: string[]): Promise<void> {
    const deletePromises = storageRefs.map(ref => 
      this.deleteProductImage(ref).catch(err => {
        console.error(`Erro ao deletar ${ref}:`, err);
      })
    );
    
    await Promise.all(deletePromises);
  }
  
  /**
   * Valida arquivo de imagem
   */
  private static validateImageFile(file: File): void {
    // Validar tipo
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(
        `Formato inválido. Use apenas: ${this.ALLOWED_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')}`
      );
    }
    
    // Validar tamanho
    if (file.size > this.MAX_SIZE_BYTES) {
      throw new Error(
        `Imagem muito grande. Tamanho máximo: ${this.MAX_SIZE_MB}MB`
      );
    }
    
    // Validar nome do arquivo
    if (!file.name || file.name.length === 0) {
      throw new Error('Nome do arquivo inválido');
    }
  }
  
  /**
   * Comprime imagem mantendo aspect ratio
   */
  private static async compressImage(
    file: File,
    maxWidthOrHeight: number,
    quality: number
  ): Promise<File> {
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Calcular dimensões mantendo aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidthOrHeight) {
              height = (height * maxWidthOrHeight) / width;
              width = maxWidthOrHeight;
            }
          } else {
            if (height > maxWidthOrHeight) {
              width = (width * maxWidthOrHeight) / height;
              height = maxWidthOrHeight;
            }
          }
          
          // Criar canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Falha ao criar contexto do canvas'));
            return;
          }
          
          // Desenhar imagem redimensionada
          ctx.drawImage(img, 0, 0, width, height);
          
          // Converter para blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Falha ao comprimir imagem'));
                return;
              }
              
              // Criar novo arquivo
              const compressedFile = new File(
                [blob], 
                file.name,
                { type: 'image/webp' } // Converter para WebP para melhor compressão
              );
              
              resolve(compressedFile);
            },
            'image/webp',
            quality
          );
        };
        
        img.onerror = () => {
          reject(new Error('Falha ao carregar imagem'));
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        reject(new Error('Falha ao ler arquivo'));
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Sanitiza nome do arquivo
   */
  private static sanitizeFileName(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100); // Limitar tamanho
  }
  
  /**
   * Obtém caminho do thumbnail a partir do caminho da imagem
   */
  private static getThumbnailPath(imagePath: string): string | null {
    const parts = imagePath.split('/');
    if (parts.length < 2) return null;
    
    const fileName = parts[parts.length - 1];
    const pathWithoutFile = parts.slice(0, -1).join('/');
    
    return `${pathWithoutFile}/thumbnails/thumb-${fileName}`;
  }
  
  /**
   * Obtém mensagem de erro amigável
   */
  private static getErrorMessage(error: any): string {
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.code) {
      switch (error.code) {
        case 'storage/unauthorized':
          return 'Sem permissão para fazer upload. Verifique suas credenciais.';
        case 'storage/canceled':
          return 'Upload cancelado';
        case 'storage/unknown':
          return 'Erro desconhecido ao fazer upload';
        default:
          return `Erro: ${error.code}`;
      }
    }
    
    return 'Falha ao fazer upload da imagem';
  }
  
  /**
   * Valida se URL é de imagem válida
   */
  static isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
  
  /**
   * Obtém tamanho estimado da imagem em MB
   */
  static getFileSizeMB(file: File): number {
    return parseFloat((file.size / (1024 * 1024)).toFixed(2));
  }
}

export default ImageUploadService; 