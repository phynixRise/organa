'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [manualBarcode, setManualBarcode] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (mode !== 'camera') return;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraReady(true);
        }
      } catch {
        setError('Caméra non disponible — utilisez le mode manuel');
        setMode('manual');
      }
    }

    startCamera();

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [mode]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
          <button
            onClick={() => setMode('camera')}
            className={`px-3 py-1 text-xs rounded ${mode === 'camera' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            📷 Caméra
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`px-3 py-1 text-xs rounded ${mode === 'manual' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            ⌨️ Manuel
          </button>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
      </div>

      {error && (
        <div className="text-xs text-red-600 mb-2">{error}</div>
      )}

      {mode === 'camera' ? (
        <div className="relative">
          <video ref={videoRef} className="w-full rounded bg-black" playsInline muted />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2/3 h-0.5 bg-red-500 opacity-70"></div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Pointez la caméra vers le code-barres
          </p>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Entrez le code-barres..."
            autoFocus
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            OK
          </button>
        </form>
      )}
    </div>
  );
}
