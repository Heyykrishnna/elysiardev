import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Eye, EyeOff, Shield, Check, X, AlertTriangle, Key, Smartphone, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { twoFactorService } from '@/services/twoFactorService';
import { motion, AnimatePresence } from 'framer-motion';

interface TwoFactorSetupProps {
  userId: string;
  isEnabled: boolean;
  onStatusChange: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ userId, isEnabled, onStatusChange }) => {
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  
  const [setupStep, setSetupStep] = useState<'generate' | 'verify' | 'backup'>('generate');
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [downloadedCodes, setDownloadedCodes] = useState(false);

  // Generate 2FA secret when enabling
  const handleStartEnable = async () => {
    setShowEnableDialog(true);
    setSetupStep('generate');
    
    const result = await twoFactorService.generateTwoFactorSecret(userId);
    
    if (result.success && result.secret && result.backupCodes && result.qrCodeUrl) {
      setSecret(result.secret);
      setQrCodeUrl(result.qrCodeUrl);
      setBackupCodes(result.backupCodes);
    } else {
      toast.error('Failed to generate 2FA secret');
      setShowEnableDialog(false);
    }
  };

  // Verify and enable 2FA
  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    const result = await twoFactorService.enableTwoFactor(userId, secret, verificationCode, backupCodes);
    
    if (result.success) {
      setSetupStep('backup');
      toast.success('2FA enabled successfully!');
    } else {
      toast.error(result.error as string || 'Invalid verification code');
    }
  };

  // Complete setup
  const handleCompleteSetup = () => {
    if (!downloadedCodes) {
      toast.error('Please download your backup codes before continuing');
      return;
    }
    
    setShowEnableDialog(false);
    setSetupStep('generate');
    setVerificationCode('');
    setDownloadedCodes(false);
    onStatusChange();
  };

  // Disable 2FA
  const handleDisable = async () => {
    if (!disablePassword) {
      toast.error('Please enter your password');
      return;
    }

    const result = await twoFactorService.disableTwoFactor(userId, disablePassword);
    
    if (result.success) {
      toast.success('2FA disabled successfully');
      setShowDisableDialog(false);
      setDisablePassword('');
      onStatusChange();
    } else {
      toast.error('Failed to disable 2FA');
    }
  };

  // Regenerate backup codes
  const handleRegenerateBackupCodes = async () => {
    const result = await twoFactorService.regenerateBackupCodes(userId, '');
    
    if (result.success && result.backupCodes) {
      setBackupCodes(result.backupCodes);
      setShowBackupCodesDialog(true);
      setDownloadedCodes(false);
      toast.success('New backup codes generated');
    } else {
      toast.error('Failed to regenerate backup codes');
    }
  };

  // Copy secret to clipboard
  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    toast.success('Secret copied to clipboard');
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  // Download backup codes
  const handleDownloadBackupCodes = () => {
    const content = `Elysiar - Two-Factor Authentication Backup Codes
Generated: ${new Date().toLocaleString()}

IMPORTANT: Store these codes securely. Each code can only be used once.

${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

If you lose access to your authenticator app, you can use one of these backup codes to sign in.
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-oasis-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setDownloadedCodes(true);
    toast.success('Backup codes downloaded');
  };

  return (
    <Card className="p-8 border-0 bg-white/60 backdrop-blur-xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isEnabled ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Shield className={`w-6 h-6 ${isEnabled ? 'text-green-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
              <Badge variant={isEnabled ? 'default' : 'secondary'} className="mt-1">
                {isEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Add an extra layer of security to your account. You'll need to enter a code from your authenticator app when you sign in.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {!isEnabled ? (
          <Button onClick={handleStartEnable} className="w-full sm:w-auto">
            <Lock className="w-4 h-4 mr-2" />
            Enable Two-Factor Authentication
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleRegenerateBackupCodes} variant="outline">
              <Key className="w-4 h-4 mr-2" />
              Regenerate Backup Codes
            </Button>
            <Button onClick={() => setShowDisableDialog(true)} variant="destructive">
              <X className="w-4 h-4 mr-2" />
              Disable 2FA
            </Button>
          </div>
        )}
      </div>

      {/* Enable 2FA Dialog */}
      <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {setupStep === 'generate' && 'Set Up Two-Factor Authentication'}
              {setupStep === 'verify' && 'Verify Your Setup'}
              {setupStep === 'backup' && 'Save Your Backup Codes'}
            </DialogTitle>
            <DialogDescription>
              {setupStep === 'generate' && 'Scan the QR code with your authenticator app'}
              {setupStep === 'verify' && 'Enter the 6-digit code from your authenticator app'}
              {setupStep === 'backup' && 'Download and store these codes securely'}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {setupStep === 'generate' && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    Install an authenticator app like <strong>Google Authenticator</strong>, <strong>Authy</strong>, or <strong>Microsoft Authenticator</strong> on your phone before continuing.
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col items-center space-y-4">
                  <div className="p-6 bg-white rounded-lg border-2 border-gray-200">
                    <QRCodeSVG value={qrCodeUrl} size={200} level="H" />
                  </div>
                  
                  <p className="text-sm text-gray-600 text-center">
                    Scan this QR code with your authenticator app
                  </p>

                  <div className="w-full pt-4 border-t">
                    <Label htmlFor="secret" className="text-sm font-medium mb-2 block">
                      Or enter this code manually:
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="secret"
                        value={secret}
                        readOnly
                        type={showSecret ? 'text' : 'password'}
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleCopySecret}
                      >
                        {copiedSecret ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEnableDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setSetupStep('verify')}>
                    Next: Verify
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {setupStep === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <Label htmlFor="verificationCode">Enter the 6-digit code from your authenticator app</Label>
                  <Input
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-2xl font-mono tracking-widest"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setSetupStep('generate')}>
                    Back
                  </Button>
                  <Button onClick={handleVerifyAndEnable} disabled={verificationCode.length !== 6}>
                    Verify & Enable
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {setupStep === 'backup' && (
              <motion.div
                key="backup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Save these backup codes in a secure location. You'll need them if you lose access to your authenticator app.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-3 p-6 bg-gray-50 rounded-lg border">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center gap-2 font-mono text-sm bg-white p-3 rounded border">
                      <span className="text-gray-500 w-6">{index + 1}.</span>
                      <span className="font-medium">{code}</span>
                    </div>
                  ))}
                </div>

                <Button onClick={handleDownloadBackupCodes} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Backup Codes
                </Button>

                <DialogFooter>
                  <Button onClick={handleCompleteSetup} disabled={!downloadedCodes}>
                    Complete Setup
                  </Button>
                </DialogFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Are you sure you want to disable 2FA? This will make your account less secure.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your account will be more vulnerable to unauthorized access without 2FA enabled.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="disablePassword">Confirm your password</Label>
              <Input
                id="disablePassword"
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisable}>
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodesDialog} onOpenChange={setShowBackupCodesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Backup Codes</DialogTitle>
            <DialogDescription>
              Your old backup codes are no longer valid. Save these new codes securely.
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Make sure to download these codes. You won't be able to see them again.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-3 p-6 bg-gray-50 rounded-lg border max-h-60 overflow-y-auto">
            {backupCodes.map((code, index) => (
              <div key={index} className="flex items-center gap-2 font-mono text-sm bg-white p-3 rounded border">
                <span className="text-gray-500 w-6">{index + 1}.</span>
                <span className="font-medium">{code}</span>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={handleDownloadBackupCodes} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Codes
            </Button>
            <Button onClick={() => setShowBackupCodesDialog(false)} disabled={!downloadedCodes}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
