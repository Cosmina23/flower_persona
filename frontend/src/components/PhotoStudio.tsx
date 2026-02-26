import { useState, useRef, useCallback, useEffect } from "react";
import { generateIllustration } from "../services/api";

interface PhotoStudioProps {
  onClose: () => void;
}

export default function PhotoStudio({ onClose }: PhotoStudioProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [peopleCount, setPeopleCount] = useState<number | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ── camera state ── */
  const [cameraPermission, setCameraPermission] = useState<
    "prompt" | "granted" | "denied" | null
  >(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /* ── photo handling ── */
  const handlePhoto = useCallback((file: File) => {
    setPhotoFile(file);
    setError("");
    setGeneratedImage("");
    setPeopleCount(null);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const clearPhoto = useCallback(() => {
    setPhotoFile(null);
    setPhotoPreview("");
    setError("");
    setGeneratedImage("");
    setPeopleCount(null);
  }, []);

  /* ── camera logic ── */
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setCameraPermission(null);
  }, [cameraStream]);

  const requestCamera = useCallback(() => {
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
    if (!video || !canvas) return;

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
        handlePhoto(file);
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  }, [handlePhoto, stopCamera]);

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
    if (!photoFile) {
      setError("Încarcă o fotografie mai întâi.");
      return;
    }

    setGenerating(true);
    setError("");
    setGeneratedImage("");
    setPeopleCount(null);

    try {
      const res = await generateIllustration(photoFile);
      setGeneratedImage(res.image);
      if (res.people_count) {
        setPeopleCount(res.people_count);
      }
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Nu s-a putut genera ilustrația.";
      setError(msg);
    } finally {
      setGenerating(false);
    }
  }, [photoFile]);

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
            Încarcă o fotografie de grup sau individuală și lasă AI-ul să
            detecteze persoanele și să creeze o ilustrație cartoon adorabilă!
          </p>

          {/* ── single photo upload ── */}
          <div className="studio-upload-area">
            <div
              className={`studio-upload studio-upload--large ${photoPreview ? "has-preview" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileInputRef.current?.click();
              }}
            >
              {photoPreview ? (
                <img
                  className="studio-upload__preview"
                  src={photoPreview}
                  alt="Fotografia încărcată"
                />
              ) : (
                <span className="studio-upload__placeholder">
                  📁<br />Încarcă fotografie
                  <br />
                  <small>AI-ul va detecta automat persoanele</small>
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePhoto(f);
                }}
              />
            </div>
            <div className="studio-upload-buttons">
              <button
                type="button"
                className="studio-camera-btn"
                onClick={requestCamera}
                title="Folosește camera"
              >
                📷 Camera
              </button>
              {photoPreview && (
                <button
                  type="button"
                  className="studio-camera-btn studio-clear-btn"
                  onClick={clearPhoto}
                  title="Șterge fotografia"
                >
                  ✕ Șterge
                </button>
              )}
            </div>
          </div>

          {/* ── people count info ── */}
          {peopleCount !== null && (
            <div className="studio-info">
              <p>
                🔍 AI a detectat <strong>{peopleCount}</strong>{" "}
                {peopleCount === 1 ? "persoană" : "persoane"} în fotografie.
              </p>
            </div>
          )}

          {/* ── error ── */}
          {error && <p className="error">{error}</p>}

          {/* ── actions ── */}
          <div className="actions" style={{ marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={generate}
              disabled={generating || !photoFile}
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
                AI-ul analizează fotografia și desenează ilustrația ta… poate dura ~30 secunde.
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
