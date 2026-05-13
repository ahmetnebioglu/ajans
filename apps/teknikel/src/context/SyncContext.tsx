'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type SyncStep = 'idle' | 'input' | 'precheck' | 'confirm' | 'syncing' | 'result';

export interface SyncContextType {
  // State
  syncStep: SyncStep;
  isModalOpen: boolean;
  isMinimized: boolean;
  havaleIndirimi: number;
  preCheckResult: any;
  syncResult: any;
  progress: { current: number; total: number };
  syncing: boolean;

  // Actions
  openSyncModal: () => void;
  closeSyncModal: () => void;
  minimize: () => void;
  maximize: () => void;
  setSyncStep: (step: SyncStep) => void;
  setHavaleIndirimi: (value: number) => void;
  setPreCheckResult: (result: any) => void;
  setSyncResult: (result: any) => void;
  setSyncing: (value: boolean) => void;
  setProgress: (current: number, total: number) => void;
  resetSync: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [syncStep, setSyncStep] = useState<SyncStep>('idle');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [havaleIndirimi, setHavaleIndirimi] = useState(5);
  const [preCheckResult, setPreCheckResult] = useState<any>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [syncing, setSyncing] = useState(false);

  const openSyncModal = useCallback(() => {
    setIsModalOpen(true);
    setIsMinimized(false);
    setSyncStep('input');
  }, []);

  const closeSyncModal = useCallback(() => {
    setIsModalOpen(false);
    setSyncStep('idle');
    setSyncResult(null);
    setPreCheckResult(null);
    setHavaleIndirimi(5);
    setProgress({ current: 0, total: 0 });
  }, []);

  const minimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximize = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const resetSync = useCallback(() => {
    setSyncStep('idle');
    setIsModalOpen(false);
    setIsMinimized(false);
    setHavaleIndirimi(5);
    setPreCheckResult(null);
    setSyncResult(null);
    setProgress({ current: 0, total: 0 });
    setSyncing(false);
  }, []);

  const handleSetProgress = useCallback((current: number, total: number) => {
    setProgress({ current, total });
  }, []);

  const value: SyncContextType = {
    syncStep,
    isModalOpen,
    isMinimized,
    havaleIndirimi,
    preCheckResult,
    syncResult,
    progress,
    syncing,
    openSyncModal,
    closeSyncModal,
    minimize,
    maximize,
    setSyncStep,
    setHavaleIndirimi,
    setPreCheckResult,
    setSyncResult,
    setSyncing,
    setProgress: handleSetProgress,
    resetSync,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSyncContext() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext must be used within SyncProvider');
  }
  return context;
}
