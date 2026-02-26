import { useState, useRef, useCallback, useEffect } from "react";
import {
  FLOWERS,
  FLOWER_LABELS,
  type FlowerKey,
} from "../data/questions";
import { generateIllustration } from "../services/api";

interface PhotoSlot {
  file: File | null;
  preview: string;
  flower: FlowerKey;
}

const emptySlot = (): PhotoSlot => ({
  file: null,
  preview: "",
  flower: "lalea",
});

interface PhotoStudioProps {
  onClose: () => void;
}

export default function PhotoStudio({ onClose }: PhotoStudioProps) {
  const [slots, setSlots] = useState<PhotoSlot[]>([emptySlot()]);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [error, setError] = useState("");
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ── camera state ── */
  const [cameraSlotIdx, setCameraSlotIdx] = useState<number | null>(null);
  const [cameraPermission, setCameraPermission] = useState<
    "prompt" | "granted" | "denied" | null
  >(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /* ── slot management ── */
  const addSlot = useCallback(() => {
    if (slots.length < 4) setSlots((prev) => [...prev, emptySlot()]);
  }, [slots.length]);

  const removeSlot = useCallback(
    (idx: number) => {
      if (slots.length > 1) setSlots((prev) => prev.filter((_, i) => i !== idx));
    },
    [slots.length]
  );

  const handlePhoto = useCallback((idx: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setSlots((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], file, preview: reader.result as string };
        return next;
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFlowerChange = useCallback((idx: number, flower: FlowerKey) => {
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], flower };
      return next;
    });
  }, []);

  /* ── camera logic ── */
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setCameraSlotIdx(null);
    setCameraPermission(null);
  }, [cameraStream]);

  const requestCamera = useCallback((idx: number) => {
    setCameraSlotIdx(idx);
    setCameraPermission("prompt");
  }, []);

  const startCamera = useCallback(async () => {
    setCameraPermission("granted");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      setCameraStream(stream);
    } catch {
      setCameraPermission("denied");
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || cameraSlotIdx === null) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        handlePhoto(cameraSlotIdx, file);
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  }, [cameraSlotIdx, handlePhoto, stopCamera]);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── generate illustration ── */
  const generate = useCallback(async () => {
    const filled = slots.filter((s) => s.file !== null) as {
      file: File;
      preview: string;
      flower: FlowerKey;
    }[];

    if (filled.length === 0) {
      setError("Adaugă cel puțin o fotografie.");
      return;
    }

    setGenerating(true);
    setError("");
    setGeneratedImage("");

    try {
      const res = await generateIllustration(
        filled.map((s) => ({ file: s.file, flower: s.flower }))
      );
      setGeneratedImage(res.image);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Nu s-a putut genera ilustrația.";
      setError(msg);
    } finally {
      setGenerating(false);
    }
  }, [slots]);

  /* ── download image ── */
  const download = useCallback(() => {
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${generatedImage}`;
    a.download = "flower-illustration.png";
    a.click();
  }, [generatedImage]);

  /* ── render ── */
  return (
    <main className="shell">
      <section className="frame">
        <div className="panel studio-panel">
          <h1>🎨 Studio Ilustrații</h1>
          <p className="start-text">
            Încarcă până la 4 fotografii, alege floarea fiecărei persoane și
            lasă AI-ul să creeze o ilustrație cartoon adorabilă!
          </p>

          {/* ── photo slots ── */}
          <div className="studio-slots">
            {slots.map((slot, idx) => (
              <div className="studio-slot" key={idx}>
                <div className="studio-slot__header">
                  <span className="studio-slot__label">
                    Persoana {idx + 1}
                  </span>
                  {slots.length > 1 && (
                    <button
                      type="button"
                      className="studio-slot__remove"
                      onClick={() => removeSlot(idx)}
                      aria-label="Șterge"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="studio-slot__body">
                  {/* photo upload */}
                  <div className="studio-upload-group">
                    <div
                      className={`studio-upload ${slot.preview ? "has-preview" : ""}`}
                      onClick={() => fileInputRefs.current[idx]?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          fileInputRefs.current[idx]?.click();
                      }}
                    >
                      {slot.preview ? (
                        <img
                          className="studio-upload__preview"
                          src={slot.preview}
                          alt={`Persoana ${idx + 1}`}
                        />
                      ) : (
                        <span className="studio-upload__placeholder">
                          📁<br />Încarcă foto
                        </span>
                      )}
                      <input
                        ref={(el) => {
                          fileInputRefs.current[idx] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handlePhoto(idx, f);
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="studio-camera-btn"
                      onClick={() => requestCamera(idx)}
                      title="Folosește camera"
                    >
                      📷 Camera
                    </button>
                  </div>

                  {/* flower selector */}
                  <select
                    className="studio-flower-select"
                    value={slot.flower}
                    onChange={(e) =>
                      handleFlowerChange(idx, e.target.value as FlowerKey)
                    }
                  >
                    {FLOWERS.map((f) => (
                      <option key={f} value={f}>
                        {FLOWER_LABELS[f]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* ── add person button ── */}
          {slots.length < 4 && (
            <button
              type="button"
              className="btn btn-secondary studio-add-btn"
              onClick={addSlot}
            >
              + Adaugă persoană
            </button>
          )}

          {/* ── error ── */}
          {error && <p className="error">{error}</p>}

          {/* ── actions ── */}
          <div className="actions" style={{ marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={generate}
              disabled={generating}
            >
              {generating ? "Se generează…" : "🎨 Generează ilustrația"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              ← Înapoi
            </button>
          </div>

          {/* ── loading indicator ── */}
          {generating && (
            <div className="ai-panel" style={{ marginTop: 14 }}>
              <p className="ai-loader">
                AI-ul desenează ilustrația ta… poate dura ~30 secunde.
              </p>
            </div>
          )}

          {/* ── result image ── */}
          {generatedImage && (
            <div className="studio-result">
              <img
                className="studio-result__image"
                src={`data:image/png;base64,${generatedImage}`}
                alt="Ilustrația generată"
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={download}
              >
                📥 Descarcă imaginea
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Camera Permission Dialog ── */}
      {cameraPermission === "prompt" && (
        <div className="camera-overlay" onClick={stopCamera}>
          <div
            className="camera-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>📷 Permisiune cameră</h2>
            <p>
              Dorești să folosești camera pentru a face o fotografie?
              Aceasta va fi folosită doar pentru a genera ilustrația.
            </p>
            <div className="camera-dialog__actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={startCamera}
              >
                Da, permite camera
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={stopCamera}
              >
                Nu, anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Camera Denied Message ── */}
      {cameraPermission === "denied" && (
        <div className="camera-overlay" onClick={stopCamera}>
          <div
            className="camera-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>⚠️ Camera nu este disponibilă</h2>
            <p>
              Nu s-a putut accesa camera. Verifică dacă ai acordat permisiunea
              în browser sau folosește opțiunea de încărcare a unei fotografii.
            </p>
            <div className="camera-dialog__actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={stopCamera}
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Camera Viewfinder ── */}
      {cameraStream && (
        <div className="camera-overlay">
          <div className="camera-viewfinder">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="camera-viewfinder__actions">
              <button
                type="button"
                className="btn btn-primary camera-capture-btn"
                onClick={capturePhoto}
              >
                📸 Fotografiază
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={stopCamera}
              >
                ✕ Anulează
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
