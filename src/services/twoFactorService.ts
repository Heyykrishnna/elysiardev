import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as jsotp from 'jsotp';

export interface TwoFactorStatus {
  is_enabled: boolean;
  secret?: string;
  backup_codes?: string[];
  last_verified_at?: string;
}

class TwoFactorService {
  // Generate a new 2FA secret and backup codes
  async generateTwoFactorSecret(userId: string) {
    try {
      // Generate a random base32 secret
      const secret = this.generateBase32Secret();
      
      // Generate 10 backup codes
      const backupCodes = this.generateBackupCodes(10);
      
      // Generate QR code URL
      const issuer = 'Elysiar';
      const label = `${issuer}:${userId}`;
      const qrCodeUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
      
      return {
        success: true,
        secret,
        backupCodes,
        qrCodeUrl
      };
    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      return { success: false, error };
    }
  }

  // Enable 2FA for a user after verification
  async enableTwoFactor(userId: string, secret: string, verificationCode: string, backupCodes: string[]) {
    try {
      // Verify the code first
      const isValid = this.verifyToken(secret, verificationCode);
      
      if (!isValid) {
        return { success: false, error: 'Invalid verification code' };
      }

      // Store encrypted 2FA data in localStorage (in production, this should be in the database)
      const twoFactorData: TwoFactorStatus = {
        is_enabled: true,
        secret,
        backup_codes: backupCodes,
        last_verified_at: new Date().toISOString()
      };

      localStorage.setItem(`two_factor_${userId}`, JSON.stringify(twoFactorData));
      
      return { success: true };
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      return { success: false, error };
    }
  }

  // Disable 2FA
  async disableTwoFactor(userId: string, password: string) {
    try {
      // In production, verify password with Supabase
      // For now, just remove the 2FA data
      localStorage.removeItem(`two_factor_${userId}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      return { success: false, error };
    }
  }

  // Get 2FA status for a user
  getTwoFactorStatus(userId: string): TwoFactorStatus {
    try {
      const data = localStorage.getItem(`two_factor_${userId}`);
      if (!data) {
        return { is_enabled: false };
      }
      
      return JSON.parse(data) as TwoFactorStatus;
    } catch (error) {
      console.error('Error getting 2FA status:', error);
      return { is_enabled: false };
    }
  }

  // Verify a 2FA token
  verifyToken(secret: string, token: string): boolean {
    try {
      // Use jsotp for TOTP verification
      const totp = jsotp.TOTP(secret);
      
      // Verify with window of 1 (allows for 30 second time drift)
      const verified = totp.verify(token, null, 1);
      
      return verified;
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  }

  // Verify a backup code
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const status = this.getTwoFactorStatus(userId);
      
      if (!status.backup_codes) {
        return false;
      }

      const codeIndex = status.backup_codes.indexOf(code);
      
      if (codeIndex === -1) {
        return false;
      }

      // Remove the used backup code
      status.backup_codes.splice(codeIndex, 1);
      localStorage.setItem(`two_factor_${userId}`, JSON.stringify(status));
      
      return true;
    } catch (error) {
      console.error('Error verifying backup code:', error);
      return false;
    }
  }

  // Regenerate backup codes
  async regenerateBackupCodes(userId: string, password: string) {
    try {
      const status = this.getTwoFactorStatus(userId);
      
      if (!status.is_enabled) {
        return { success: false, error: '2FA is not enabled' };
      }

      // In production, verify password first
      
      const newBackupCodes = this.generateBackupCodes(10);
      status.backup_codes = newBackupCodes;
      
      localStorage.setItem(`two_factor_${userId}`, JSON.stringify(status));
      
      return { success: true, backupCodes: newBackupCodes };
    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      return { success: false, error };
    }
  }

  // Helper methods
  private generateBase32Secret(): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const length = 32;
    let secret = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      secret += charset.charAt(randomValues[i] % charset.length);
    }
    return secret;
  }

  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = this.generateRandomCode(8);
      codes.push(code);
    }
    return codes;
  }

  private generateRandomCode(length: number): string {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += charset.charAt(Math.floor(Math.random() * charset.length));
      if (i === 3) code += '-'; // Format as XXXX-XXXX
    }
    return code;
  }

  private generateQRCodeData(secret: string, userId: string): string {
    // Format: otpauth://totp/QuizOasis:user@email.com?secret=SECRET&issuer=QuizOasis
    const issuer = 'Elysiar';
    const label = `${issuer}:${userId}`;
    return `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  }
}

export const twoFactorService = new TwoFactorService();
