import math
import numpy as np
from PIL import Image
from tqdm import tqdm
import os
from concurrent.futures import ThreadPoolExecutor
import json
from concurrent.futures import as_completed


def hex_code(r, g, b):
    return f"#{int(r):02x}{int(g):02x}{int(b):02x}"


def luminance(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b


def extract_palette(image_path, k):
    img = Image.open(image_path).convert("RGB")
    data = np.asarray(img, dtype=np.uint8).reshape(-1, 3)
    n_pixels = data.shape[0]

    # Initialize means by sampling random pixels
    rng = np.random.default_rng()
    indices = rng.integers(0, n_pixels, size=k)
    means = data[indices].astype(np.float32)

    NUM_CLUSTERINGS = 100

    # Helper to compute nearest centers in memory-efficient vectorized blocks
    def _compute_nearest_all(means_local):
        # choose block size based on available memory budget (approximate)
        # target ~80MB for distance block: block_size * k * 4(bytes per float32)
        mem_budget = 80 * 1024 * 1024
        block_size = max(1, int(mem_budget / (k * 4)))
        nearest = np.empty(n_pixels, dtype=np.int64)
        for start in range(0, n_pixels, block_size):
            end = min(n_pixels, start + block_size)
            block = data[start:end].astype(np.float32)
            # distances shape: (block_size, k)
            d = np.sum((block[:, None, :] - means_local[None, :, :]) ** 2, axis=2, dtype=np.float32)
            nearest[start:end] = np.argmin(d, axis=1)
        return nearest

    change_magnitude = np.full(k, np.inf, dtype=np.float32)

    for _ in range(NUM_CLUSTERINGS):
        old_means = means.copy()

        # Assignment step (vectorized, block-wise)
        nearest = _compute_nearest_all(means)

        # Recompute means using bincount for speed
        counts = np.bincount(nearest, minlength=k).astype(np.float32)  # shape (k,)

        # For each channel, sum values per cluster
        sums_r = np.bincount(nearest, weights=data[:, 0], minlength=k).astype(np.float32)
        sums_g = np.bincount(nearest, weights=data[:, 1], minlength=k).astype(np.float32)
        sums_b = np.bincount(nearest, weights=data[:, 2], minlength=k).astype(np.float32)

        # Avoid division by zero; fill new_means for non-empty clusters
        nonzero = counts > 0
        new_means = np.zeros_like(means)
        new_means[nonzero, 0] = sums_r[nonzero] / counts[nonzero]
        new_means[nonzero, 1] = sums_g[nonzero] / counts[nonzero]
        new_means[nonzero, 2] = sums_b[nonzero] / counts[nonzero]

        # For empty clusters, reinitialize to random pixels
        if not np.all(nonzero):
            empty_idx = np.where(~nonzero)[0]
            reinit_pixels = data[rng.integers(0, n_pixels, size=empty_idx.size)].astype(np.float32)
            new_means[empty_idx] = reinit_pixels

        means = new_means.astype(np.float32)

        # Compute change magnitude
        change_magnitude = np.sqrt(np.sum((means - old_means) ** 2, axis=1))

        if np.all(change_magnitude < 1):
            break

    palette = [tuple(int(x) for x in m) for m in means.astype(np.uint8)]
    palette.sort(key=lambda rgb: luminance(*rgb))
    return palette

def main():
    src_dir = "public/book-covers"
    dst_dir = "lib/book-palettes"
    os.makedirs(dst_dir, exist_ok=True)

    exts = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".tif", ".tiff", ".avif", ".bmp"}
    files = [
        f
        for f in os.listdir(src_dir)
        if os.path.isfile(os.path.join(src_dir, f))
        and os.path.splitext(f)[1].lower() in exts
    ]

    # Choose a reasonable number of threads for I/O-bound work
    workers = min(32, max(1, (os.cpu_count() or 1) * 5))

    def _process(fname):
        in_path = os.path.join(src_dir, fname)
        out_name = os.path.splitext(fname)[0] + ".json"
        out_path = os.path.join(dst_dir, out_name)
        try:
            palette = extract_palette(in_path, 5)
            hexes = [hex_code(r, g, b) for r, g, b in palette]
            with open(out_path, "w", encoding="utf-8") as fh:
                json.dump({"palette": hexes}, fh, ensure_ascii=False, indent=2)
            return None
        except Exception as e:
            return f"{fname}: {e}"


    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(_process, f): f for f in files}
        for fut in tqdm(as_completed(futures), total=len(futures), desc="Processing images"):
            err = fut.result()
            if err:
                print(f"Failed to process {err}")


if __name__ == "__main__":
    main()