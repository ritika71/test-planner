'use client';

import React, { useRef, useState, type ChangeEvent } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Pencil, Upload, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  onChange: (dataUrl: string) => void;
  value?: string;
}

export function SignaturePad({ onChange, value }: SignaturePadProps) {
  const padRef = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentTab, setCurrentTab] = useState('draw');

  const clear = () => {
    padRef.current?.clear();
    onChange('');
  };

  const handleDrawEnd = () => {
    if (padRef.current) {
      onChange(padRef.current.toDataURL('image/png'));
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onChange(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    onChange('');
    if(padRef.current) padRef.current.clear();
    if(fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="draw">
          <Pencil className="mr-2 h-4 w-4" /> Draw
        </TabsTrigger>
        <TabsTrigger value="upload">
          <Upload className="mr-2 h-4 w-4" /> Upload
        </TabsTrigger>
      </TabsList>
      <TabsContent value="draw">
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
      </TabsContent>
      <TabsContent value="upload">
        <div className="rounded-lg border bg-card p-4">
          <Label htmlFor="signature-upload">Upload an image of your signature</Label>
          <Input
            ref={fileInputRef}
            id="signature-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="mt-2"
          />
          {value && currentTab === 'upload' && (
             <div className="mt-4">
                <p className="text-sm font-medium">Preview:</p>
                <img src={value} alt="Signature Preview" className="mt-2 h-24 w-auto rounded border" />
             </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
