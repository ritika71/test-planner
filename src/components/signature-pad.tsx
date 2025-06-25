'use client';

import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

interface SignaturePadProps {
  onChange: (dataUrl: string) => void;
  value?: string;
}

export function SignaturePad({ onChange }: SignaturePadProps) {
  const padRef = useRef<SignatureCanvas>(null);

  const clear = () => {
    padRef.current?.clear();
    onChange('');
  };

  const handleDrawEnd = () => {
    if (padRef.current) {
      onChange(padRef.current.toDataURL('image/png'));
    }
  };

  return (
    <div className="relative rounded-lg border bg-card">
      <SignatureCanvas
        ref={padRef}
        penColor="hsl(var(--primary))"
        canvasProps={{
          className: 'w-full h-[200px] rounded-lg',
        }}
        onEnd={handleDrawEnd}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={clear}
        className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label="Clear signature"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
