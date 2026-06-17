'use client';

import React, { useEffect } from 'react';
import { Modal, Button, Alert, Spin, message, InputNumber, Card, Tag } from 'antd';
import { CloseOutlined, ExpandOutlined, CompressOutlined } from '@ant-design/icons';
import { useSyncContext } from '@/src/context/SyncContext';
import { preCheckBulkSync, executeBulkSync } from '@/app/actions/stok-sync-actions';

export default function FloatingSyncWidget() {
  const {
    syncStep,
    isModalOpen,
    isMinimized,
    havaleIndirimi,
    preCheckResult,
    syncResult,
    progress,
    syncing,
    setSyncStep,
    setHavaleIndirimi,
    setPreCheckResult,
    setSyncResult,
    setSyncing,
    setProgress,
    closeSyncModal,
    minimize,
    maximize,
  } = useSyncContext();

  // beforeunload uyarısı: sadece syncing aşamasında
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (syncStep === 'syncing') {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [syncStep]);

  const handlePreCheck = async () => {
    setSyncing(true);
    try {
      const result = await preCheckBulkSync(havaleIndirimi);
      if (result.success) {
        setPreCheckResult(result);
        setSyncStep('confirm');
        message.success('Ön kontrol tamamlandı');
      } else {
        message.error(result.message);
      }
    } catch (error: any) {
      message.error('Ön kontrol hatası: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleExecuteSync = async () => {
    if (!preCheckResult || !preCheckResult.validPairs) return;
    
    setSyncing(true);
    setSyncStep('syncing');
    
    const allPairs = preCheckResult.validPairs;
    const totalItems = allPairs.length;
    setProgress(0, totalItems);
    
    const BATCH_SIZE = 3;
    let accumulatedResult = {
      success: true,
      message: '',
      totalBilsoftItems: 0,
      totalIdeasoftItems: 0,
      matchedCount: totalItems,
      updatedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [] as any[],
    };

    try {
      for (let i = 0; i < totalItems; i += BATCH_SIZE) {
        // Chunk pairs
        const chunk = allPairs.slice(i, i + BATCH_SIZE);
        
        // Execute chunk
        const chunkResult = await executeBulkSync(chunk, havaleIndirimi);
        
        // Accumulate results
        accumulatedResult.updatedCount += chunkResult.updatedCount;
        accumulatedResult.skippedCount += chunkResult.skippedCount;
        accumulatedResult.errorCount += chunkResult.errorCount;
        accumulatedResult.errors = [...accumulatedResult.errors, ...chunkResult.errors];
        if (!chunkResult.success && chunkResult.errorCount === chunk.length) {
            // Only fail entirely if all failed in a chunk? No, just keep going.
        }
        
        // Update progress
        setProgress(Math.min(i + BATCH_SIZE, totalItems), totalItems);
      }
      
      accumulatedResult.message = `Senkronizasyon tamamlandı. Güncellenen: ${accumulatedResult.updatedCount}, Hata: ${accumulatedResult.errorCount}`;
      accumulatedResult.success = accumulatedResult.errorCount < totalItems;
      
      setSyncResult(accumulatedResult);
      setSyncStep('result');
      
      if (accumulatedResult.errorCount === 0) {
        message.success('Senkronizasyon başarıyla tamamlandı!');
      } else if (accumulatedResult.updatedCount > 0) {
        message.warning(`Senkronizasyon kısmen tamamlandı. ${accumulatedResult.errorCount} hata oluştu.`);
      } else {
        message.error('Senkronizasyon başarısız oldu.');
      }
    } catch (error: any) {
      message.error('Senkronizasyon hatası: ' + error.message);
      setSyncStep('result');
      setSyncResult({
          ...accumulatedResult,
          success: false,
          message: 'Kritik hata: ' + error.message
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleCloseSyncModal = () => {
    if (syncStep === 'syncing') {
      message.warning('Senkronizasyon devam ediyor, lütfen bekleyin');
      return;
    }
    closeSyncModal();
  };

  const handleTestMinimize = () => {
    setProgress(45, 100);
    minimize();
    message.info('Test modu: Minimize özelliğini test edebilirsiniz. Sayfalar arası gezinebilirsiniz!');
  };

  // Floating Widget (Minimize Durumu)
  if (isMinimized && isModalOpen) {
    const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

    // Adıma göre durum belirleme
    const getStatusInfo = () => {
      switch (syncStep) {
        case 'syncing':
          return {
            title: '🔄 Senkronizasyon Devam Ediyor',
            subtitle: 'Sayfalar arası gezinebilirsiniz',
            bgColor: 'bg-blue-50 dark:bg-blue-900',
            borderColor: 'border-blue-300 dark:border-blue-700',
            showProgress: true,
          };
        case 'input':
          return {
            title: 'Bilgi Girişi Gerekiyor',
            subtitle: 'Havale indirimi giriniz',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900',
            borderColor: 'border-yellow-300 dark:border-yellow-700',
            showProgress: false,
          };
        case 'confirm':
          return {
            title: 'Onay Gerekiyor',
            subtitle: 'Ön kontrol sonuçlarını inceleyiniz',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900',
            borderColor: 'border-yellow-300 dark:border-yellow-700',
            showProgress: false,
          };
        case 'result':
          return {
            title: syncResult?.success ? '✅ İşlem Tamamlandı' : '❌ İşlem Başarısız',
            subtitle: 'Sonuçları görüntüleyiniz',
            bgColor: syncResult?.success ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900',
            borderColor: syncResult?.success ? 'border-green-300 dark:border-green-700' : 'border-red-300 dark:border-red-700',
            showProgress: false,
          };
        default:
          return {
            title: '🔄 Senkronizasyon',
            subtitle: 'Devam etmek için genişletiniz',
            bgColor: 'bg-slate-50 dark:bg-slate-900',
            borderColor: 'border-slate-300 dark:border-slate-700',
            showProgress: false,
          };
      }
    };

    const status = getStatusInfo();

    return (
      <div
        className={`fixed bottom-6 right-6 z-50 rounded-lg shadow-2xl border-2 p-4 w-80 ${status.bgColor} ${status.borderColor}`}
        style={{
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        <style>{`
          @keyframes slideUp {
            from {
              transform: translateY(100px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
          .pulse-animation {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {syncStep === 'syncing' ? (
              <Spin size="small" />
            ) : (
              <div className="pulse-animation text-lg">
                {syncStep === 'input' || syncStep === 'confirm' ? '⚠️' : syncStep === 'result' ? (syncResult?.success ? '✅' : '❌') : '🔄'}
              </div>
            )}
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {status.title}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              type="text"
              size="small"
              icon={<ExpandOutlined />}
              onClick={maximize}
              className="text-slate-500 hover:text-slate-700"
            />
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={handleCloseSyncModal}
              disabled={syncStep === 'syncing'}
              className="text-slate-500 hover:text-slate-700"
            />
          </div>
        </div>

        {/* Progress Bar - Sadece syncing adımında göster */}
        {status.showProgress && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {progress.current} / {progress.total} ürün
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Text */}
        <p className="text-xs text-slate-600 dark:text-slate-400 text-center font-medium">
          {status.subtitle}
        </p>
      </div>
    );
  }

  // Full Modal
  if (!isModalOpen) return null;

   return (
     <Modal
       title={
         <div className="flex items-center justify-between w-full">
           <span>Stok & Fiyat Senkronizasyonu</span>
           {(syncStep === 'syncing' || syncStep === 'input' || syncStep === 'confirm' || syncStep === 'result') && (
             <Button
               type="text"
               size="small"
               icon={<CompressOutlined />}
               onClick={minimize}
               title="Minimize"
               className="ml-auto"
               disabled={syncStep === 'syncing' ? false : false}
             />
           )}
         </div>
       }
      open={isModalOpen}
      onCancel={handleCloseSyncModal}
      footer={null}
      width={800}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      {/* AŞAMA 1: Havale İndirimi Girişi */}
      {syncStep === 'input' && (
        <div className="space-y-4">
          <Alert
            message="Bilsoft stok kartlarını Ideasoft ürünleriyle senkronize eder"
            description="Bu işlem Bilsoft'taki tüm stok kartlarını çeker ve Ideasoft ürünlerinin stok miktarı ve fiyatlarını günceller. SKU eşleştirmesi yapılır."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Havale İndirimi (%)
            </label>
            <InputNumber
              value={havaleIndirimi}
              onChange={(val) => setHavaleIndirimi(val || 5)}
              min={0}
              max={100}
              step={0.1}
              style={{ width: '100%' }}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Price2 için uygulanacak havale indirimi yüzdesini girin
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button onClick={handleCloseSyncModal}>İptal</Button>
            <Button
              type="primary"
              onClick={handlePreCheck}
              loading={syncing}
              disabled={syncing}
            >
              Önizleme Yap
            </Button>
            <Button
              type="dashed"
              onClick={handleTestMinimize}
              style={{ color: '#666' }}
            >
              🧪 Test Minimize
            </Button>
          </div>
        </div>
      )}

      {/* AŞAMA 2: Ön Kontrol Sonuçları */}
      {syncStep === 'confirm' && preCheckResult && (
        <div className="space-y-4">
          <Alert
            message="Ön Kontrol Tamamlandı"
            description={preCheckResult.message}
            type="success"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          {/* Sonuç Badgeleri */}
          <div className="flex gap-2 flex-wrap">
            <Tag color="green" className="px-3 py-1 text-sm">
              ✅ {preCheckResult.validPairs.length} Geçerli
            </Tag>
            <Tag color="red" className="px-3 py-1 text-sm">
              ❌ {preCheckResult.notFoundSkus.length} Bulunamadı
            </Tag>
            <Tag color="orange" className="px-3 py-1 text-sm">
              ⚠️ {preCheckResult.invalidSkus.length} Geçersiz
            </Tag>
          </div>

          {/* Bulunamayan SKU'lar */}
          {preCheckResult.notFoundSkus.length > 0 && (
            <Card
              title={`Ideasoft'ta Bulunamayan Stok Kodları (${preCheckResult.notFoundSkus.length})`}
              size="small"
              className="bg-red-50 dark:bg-red-900/20"
            >
              <div className="flex flex-wrap gap-2">
                {preCheckResult.notFoundSkus.slice(0, 10).map((item: any, idx: number) => (
                  <Tag key={idx} color="red" className="text-xs">
                    {item.kod}
                  </Tag>
                ))}
                {preCheckResult.notFoundSkus.length > 10 && (
                  <Tag color="red" className="text-xs">
                    +{preCheckResult.notFoundSkus.length - 10} tane daha
                  </Tag>
                )}
              </div>
            </Card>
          )}

          {/* Geçersiz Stoklar */}
          {preCheckResult.invalidSkus.length > 0 && (
            <Card
              title={`Geçersiz Stok Kodları (${preCheckResult.invalidSkus.length})`}
              size="small"
              className="bg-orange-50 dark:bg-orange-900/20"
            >
              <div className="flex flex-wrap gap-2">
                {preCheckResult.invalidSkus.slice(0, 10).map((item: any, idx: number) => (
                  <Tag key={idx} color="orange" className="text-xs">
                    {item.kod}
                  </Tag>
                ))}
                {preCheckResult.invalidSkus.length > 10 && (
                  <Tag color="orange" className="text-xs">
                    +{preCheckResult.invalidSkus.length - 10} tane daha
                  </Tag>
                )}
              </div>
            </Card>
          )}

          {/* Geçerli Stoklar */}
          <Card
            title={`Senkronize Edilecek Stok Kodları (${preCheckResult.validPairs.length})`}
            size="small"
            className="bg-green-50 dark:bg-green-900/20"
          >
            <div className="flex flex-wrap gap-2">
              {preCheckResult.validPairs.slice(0, 15).map((item: any, idx: number) => (
                <Tag key={idx} color="green" className="text-xs">
                  {item.bilsoftKod}
                </Tag>
              ))}
              {preCheckResult.validPairs.length > 15 && (
                <Tag color="green" className="text-xs">
                  +{preCheckResult.validPairs.length - 15} tane daha
                </Tag>
              )}
            </div>
          </Card>

          <div className="flex gap-2 justify-end">
            <Button onClick={() => setSyncStep('input')}>Geri</Button>
            <Button
              type="primary"
              onClick={handleExecuteSync}
              loading={syncing}
              disabled={syncing || preCheckResult.validPairs.length === 0}
              danger
            >
              {preCheckResult.validPairs.length} Ürünü Senkronize Et
            </Button>
          </div>
        </div>
      )}

      {/* AŞAMA 3: Senkronizasyon Devam Ediyor */}
      {syncStep === 'syncing' && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Spin size="large" tip="Senkronizasyon devam ediyor..." />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
            Sayfalar arası gezinebilirsiniz. Senkronizasyon arka planda devam edecektir.
          </p>
          <Button
            type="text"
            size="small"
            onClick={minimize}
            className="mt-4"
          >
            Minimize Et
          </Button>
        </div>
      )}

      {/* AŞAMA 4: Sonuç */}
      {syncStep === 'result' && syncResult && (
        <div className="space-y-4">
          {syncResult.success ? (
            <Alert
              message="✅ Senkronizasyon Başarılı"
              description={syncResult.message}
              type="success"
              showIcon
            />
          ) : (
            <Alert
              message="❌ Senkronizasyon Başarısız"
              description={syncResult.message}
              type="error"
              showIcon
            />
          )}

          <Card title="Senkronizasyon Özeti" size="small">
            <div className="space-y-2 text-sm">
              <div>
                <strong>Bilsoft Toplam:</strong> {syncResult.totalBilsoftItems} stok kartı
              </div>
              <div>
                <strong>Ideasoft Toplam:</strong> {syncResult.totalIdeasoftItems} ürün
              </div>
              <div>
                <strong>Eşleşen:</strong> {syncResult.matchedCount} ürün
              </div>
              <div>
                <strong>Güncellenen:</strong> {syncResult.updatedCount} ürün
              </div>
              <div>
                <strong>Atlanılan:</strong> {syncResult.skippedCount} ürün
              </div>
              {syncResult.errorCount > 0 && (
                <div>
                  <strong>Hata:</strong> {syncResult.errorCount} ürün
                </div>
              )}
            </div>
          </Card>

          {syncResult.errors && syncResult.errors.length > 0 && (
            <Card
              title={`Hata Detayları (${syncResult.errors.length})`}
              size="small"
              className="bg-red-50 dark:bg-red-900/20"
            >
              <div className="text-xs text-red-600 dark:text-red-300 space-y-1 max-h-40 overflow-y-auto">
                {syncResult.errors.map((err: any, idx: number) => (
                  <div key={idx}>
                    <strong>{err.sku}:</strong> {err.error}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="primary" onClick={handleCloseSyncModal}>
              Kapat
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
