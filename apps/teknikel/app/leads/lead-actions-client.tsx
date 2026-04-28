'use client';

import { useState } from 'react';
import { scheduleCall } from './actions';
// @ts-ignore
import { Button } from '@ajans/ui';
import { Phone, Check } from 'lucide-react';

export function LeadActionsClient({ leadId, status }: { leadId: string, status: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(status === 'CALL_SCHEDULED');

  const handleSchedule = async () => {
    setLoading(true);
    const res = await scheduleCall(leadId);
    setLoading(false);
    if (res.success) {
      setDone(true);
    } else {
      alert('Hata: ' + res.error);
    }
  };

  return (
    <Button 
      onClick={handleSchedule} 
      disabled={loading || done}
      variant={done ? "outline" : "primary"}
      className="w-full mt-4"
    >
      {loading ? 'İşleniyor...' : done ? (
        <><Check className="w-4 h-4 mr-2" /> Randevu Alındı</>
      ) : (
        <><Phone className="w-4 h-4 mr-2" /> Bugün Aranacak</>
      )}
    </Button>
  );
}
