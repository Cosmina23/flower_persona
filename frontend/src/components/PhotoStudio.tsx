import { useState, useRef, useCallback } from "react";
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
                        📷<br />Apasă pentru foto
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
    </main>
  );
}
