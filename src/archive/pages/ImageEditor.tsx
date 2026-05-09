import { useEffect, useRef, useState } from "react";

type CursorPreview = {
    x: number;
    y: number;
    size: number;
    visible: boolean;
};

export default function HeatmapDogEditor() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isPainting, setIsPainting] = useState(false);
    const [isCooling, setIsCooling] = useState(false);
    const [brushSize, setBrushSize] = useState(200);
    const [sensitivity, setSensitivity] = useState(2.5);
    const [cursorPreview, setCursorPreview] = useState<CursorPreview>({
        x: 0,
        y: 0,
        size: 0,
        visible: false,
    });

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const historyRef = useRef<Float32Array[]>([]);
    const historyIndexRef = useRef(-1);
    const baseImageRef = useRef<HTMLImageElement | null>(null);
    const heatmapRef = useRef<Float32Array>(new Float32Array());
    const pointerRef = useRef({ x: 0, y: 0 });
    const animationRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef(0);
    const hasStrokeChangesRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        const loadDog = async () => {
            try {
                let validImageUrl: string | null = null;
                let attempts = 0;

                while (!validImageUrl && attempts < 12) {
                    attempts += 1;
                    const res = await fetch("https://random.dog/woof.json");
                    const data = await res.json();
                    const url = data.url || "";
                    const isImage = /\.(jpg|jpeg|png|webp)$/i.test(url);

                    if (isImage) {
                        validImageUrl = url;
                    }
                }

                if (!validImageUrl) {
                    throw new Error("No se encontró una imagen válida en random.dog");
                }

                const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(
                    validImageUrl.replace(/^https?:\/\//, "")
                )}`;

                if (!cancelled) {
                    setImageUrl(proxyUrl);
                }
            } catch (error) {
                console.error("Error cargando imagen:", error);
            }
        };

        loadDog();

        return () => {
            cancelled = true;
        };
    }, []);

    const initHeatmap = (width: number, height: number) => {
        const initial = new Float32Array(width * height).fill(0);
        heatmapRef.current = initial;
        historyRef.current = [new Float32Array(initial)];
        historyIndexRef.current = 0;
    };

    const getIndex = (x: number, y: number, width: number) => y * width + x;

    const clamp = (value: number, min = 0, max = 1) =>
        Math.max(min, Math.min(max, value));

    const jetColor = (v: number): [number, number, number] => {
        const value = clamp(v);
        const fourValue = 4 * value;
        const r = clamp(Math.min(fourValue - 1.5, -fourValue + 4.5));
        const g = clamp(Math.min(fourValue - 0.5, -fourValue + 3.5));
        const b = clamp(Math.min(fourValue + 0.5, -fourValue + 2.5));
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };

    const saveSnapshot = () => {
        const snapshot = new Float32Array(heatmapRef.current);
        const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1);
        trimmed.push(snapshot);

        if (trimmed.length > 100) {
            trimmed.shift();
        }

        historyRef.current = trimmed;
        historyIndexRef.current = trimmed.length - 1;
    };

    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        const img = baseImageRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const overlayCanvas = document.createElement("canvas");
        overlayCanvas.width = canvas.width;
        overlayCanvas.height = canvas.height;

        const overlayCtx = overlayCanvas.getContext("2d");
        if (!overlayCtx) return;

        const overlay = overlayCtx.createImageData(canvas.width, canvas.height);

        for (let i = 0; i < heatmapRef.current.length; i++) {
            const intensity = heatmapRef.current[i];
            const [r, g, b] = jetColor(intensity);
            overlay.data[i * 4 + 0] = r;
            overlay.data[i * 4 + 1] = g;
            overlay.data[i * 4 + 2] = b;
            overlay.data[i * 4 + 3] = 110;
        }

        overlayCtx.putImageData(overlay, 0, 0);
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(overlayCanvas, 0, 0);
        ctx.restore();
    };

    const restoreSnapshot = (snapshot: Float32Array | undefined) => {
        if (!snapshot) return;
        heatmapRef.current = new Float32Array(snapshot);
        redrawCanvas();
    };

    const applyHeat = (x: number, y: number, delta: number, radius = brushSize) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const width = canvas.width;
        const height = canvas.height;
        const heatmap = heatmapRef.current;

        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const nx = x + dx;
                const ny = y + dy;

                if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > radius) continue;

                const falloff = 1 - distance / radius;
                const idx = getIndex(nx, ny, width);
                heatmap[idx] = clamp(heatmap[idx] + delta * falloff);
                hasStrokeChangesRef.current = true;
            }
        }
    };

    useEffect(() => {
        if (!imageUrl) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;

        img.onload = () => {
            baseImageRef.current = img;

            const canvas = canvasRef.current;
            if (!canvas) return;

            canvas.width = img.width;
            canvas.height = img.height;
            initHeatmap(img.width, img.height);
            redrawCanvas();
        };
    }, [imageUrl]);

    useEffect(() => {
        const step = (timestamp: number) => {
            if (!lastFrameTimeRef.current) { };
        };

    }, []);

    return (
        <div className="p-4">
            <p>Image editor archived</p>
        </div>
    );
}
