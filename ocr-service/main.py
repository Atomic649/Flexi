from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
import easyocr
import numpy as np
from PIL import Image, ImageEnhance
from pillow_heif import register_heif_opener
import io
import time
import asyncio
import json
import uvicorn

register_heif_opener()

app = FastAPI()

# Load EasyOCR reader once at startup (Thai + English)
print("Loading EasyOCR model (th + en)...")
reader = easyocr.Reader(["th", "en"], gpu=False)
print("EasyOCR model loaded.")


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes))

    # Ensure RGB
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    # Target longest side at 1600px — enough for EasyOCR accuracy, much faster than 3000px
    target = 1600
    longest = max(img.width, img.height)
    if longest > target:
        scale = target / longest
        img = img.resize(
            (int(img.width * scale), int(img.height * scale)), Image.LANCZOS
        )
    elif min(img.width, img.height) < 800:
        # Upscale only if image is genuinely tiny
        scale = 800 / min(img.width, img.height)
        img = img.resize(
            (int(img.width * scale), int(img.height * scale)), Image.LANCZOS
        )

    # Contrast boost helps Thai characters; skip sharpness (slow, marginal gain)
    img = ImageEnhance.Contrast(img).enhance(1.5)

    return np.array(img)


@app.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    try:
        t0 = time.time()
        image_bytes = await file.read()
        img_array = preprocess_image(image_bytes)
        t1 = time.time()

        # canvas_size=1280 halves detection time vs default 2560, batch_size=4 speeds up recognition
        results = reader.readtext(
            img_array,
            detail=1,
            paragraph=False,
            canvas_size=1280,
            batch_size=4,
        )
        t2 = time.time()

        # Sort top-to-bottom, then left-to-right by top-left corner of bbox
        results_sorted = sorted(results, key=lambda r: (r[0][0][1], r[0][0][0]))

        lines = []
        total_conf = 0.0
        for bbox, text, conf in results_sorted:
            stripped = text.strip()
            if stripped:
                lines.append(stripped)
                total_conf += conf

        avg_conf = round(total_conf / len(lines), 4) if lines else 0.0
        full_text = "\n".join(lines)

        print(f"OCR done: {len(lines)} lines, avg conf {avg_conf} | preprocess {t1-t0:.2f}s | ocr {t2-t1:.2f}s | total {t2-t0:.2f}s")

        return JSONResponse(
            {"text": full_text, "lines": lines, "confidence": avg_conf}
        )
    except Exception as e:
        print(f"OCR error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ocr-stream")
async def ocr_image_stream(file: UploadFile = File(...)):
    """SSE endpoint — streams progress events then final OCR result."""
    image_bytes = await file.read()

    async def generate():
        try:
            yield f"data: {json.dumps({'stage': 'preprocessing', 'progress': 15, 'message': 'Preprocessing image'})}\n\n"

            t0 = time.time()
            img_array = preprocess_image(image_bytes)
            t1 = time.time()

            yield f"data: {json.dumps({'stage': 'ocr_running', 'progress': 35, 'message': 'Running OCR model'})}\n\n"

            # reader.readtext is CPU-bound — run in thread pool so we don't block the event loop
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                None,
                lambda: reader.readtext(
                    img_array,
                    detail=1,
                    paragraph=False,
                    canvas_size=1280,
                    batch_size=4,
                ),
            )
            t2 = time.time()

            yield f"data: {json.dumps({'stage': 'processing', 'progress': 85, 'message': 'Processing results'})}\n\n"

            results_sorted = sorted(results, key=lambda r: (r[0][0][1], r[0][0][0]))
            lines = []
            total_conf = 0.0
            for bbox, text, conf in results_sorted:
                stripped = text.strip()
                if stripped:
                    lines.append(stripped)
                    total_conf += conf

            avg_conf = round(total_conf / len(lines), 4) if lines else 0.0
            full_text = "\n".join(lines)

            print(
                f"OCR-stream done: {len(lines)} lines, avg conf {avg_conf} "
                f"| preprocess {t1-t0:.2f}s | ocr {t2-t1:.2f}s | total {t2-t0:.2f}s"
            )

            yield f"data: {json.dumps({'stage': 'done', 'progress': 100, 'text': full_text, 'lines': lines, 'confidence': avg_conf})}\n\n"
        except Exception as e:
            print(f"OCR-stream error: {e}")
            yield f"data: {json.dumps({'stage': 'error', 'progress': 0, 'message': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
