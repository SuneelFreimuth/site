import sharp from 'sharp';
import cliProgress from 'cli-progress';

function hexCode(r, g, b) {
    return `#${r.toString(16).padStart(2, '0')}${g
        .toString(16)
        .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function nearestMean(pixel, means) {
    let nearest = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < means.length; i += 3) {
        const mean = means.subarray(i, i + 3);
        const distance = (
            (pixel[0] - mean[0]) ** 2 +
            (pixel[1] - mean[1]) ** 2 +
            (pixel[2] - mean[2]) ** 2
        );

        if (distance < nearestDistance) {
            nearest = i;
            nearestDistance = distance;
        }
    }

    return nearest;
}

function recluster(image, means, changeMagnitude) {
    const clusters = new Array(means.length / 3).fill(0).map(() => ({
        sum: new Uint32Array(3),
        count: 0,
    }));
    for (let i = 0; i < image.length; i += 3) {
        const pixel = image.subarray(i, i + 3);
        const nearest = nearestMean(pixel, means);
        clusters[nearest / 3].sum[0] += pixel[0];
        clusters[nearest / 3].sum[1] += pixel[1];
        clusters[nearest / 3].sum[2] += pixel[2];
        clusters[nearest / 3].count++;
    }

    for (let i = 0; i < clusters.length; i++) {
        if (clusters[i].count > 0) {
            means[i * 3] = Math.floor(clusters[i].sum[0] / clusters[i].count);
            means[i * 3 + 1] = Math.floor(clusters[i].sum[1] / clusters[i].count);
            means[i * 3 + 2] = Math.floor(clusters[i].sum[2] / clusters[i].count);

            const change = Math.sqrt(
                (means[i * 3] - means[i * 3]) ** 2 +
                (means[i * 3 + 1] - means[i * 3 + 1]) ** 2 +
                (means[i * 3 + 2] - means[i * 3 + 2]) ** 2
            );
            changeMagnitude[i] = change;
        }
    }
}

function luminance(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

async function extractPalette(image, size) {
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    const means = new Uint8Array(size * 3);
    for (let i = 0; i < means.length; i++) {
        const j = Math.floor(Math.random() * (data.length / 3)) * 3;
        means[i] = data[j];
    }
    const changeMagnitude = new Float32Array(size).fill(256 * 256);

    const NUM_CLUSTERINGS = 100;
    const bar = new cliProgress.SingleBar({
        format: "Extracting palette... [{bar}] {percentage}% | ETA: {eta}s",
    }, cliProgress.Presets.shades_classic);
    bar.start(NUM_CLUSTERINGS, 0);
    for (let i = 0; i < NUM_CLUSTERINGS; i++) {
        recluster(data, means, changeMagnitude);
        if (changeMagnitude.every(m => m < 1)) {
            console.log('Early exit after', i + 1, 'clusterings');
            break;
        }
        bar.increment();
    }
    bar.stop();

    const palette = [];
    for (let i = 0; i < means.length; i += 3) {
        palette.push([means[i], means[i + 1], means[i + 2]]);
    }
    const byLuminance = (a, b) =>
        luminance(a[0], a[1], a[2]) - luminance(b[0], b[1], b[2]);
    return palette.sort(byLuminance);
}

async function main() {
    const image = sharp('public/book-covers/a-crown-of-swords.jpeg');
    const palette = await extractPalette(image, 5);
    console.log(palette.map(([r, g, b]) => hexCode(r, g, b)));
}

await main();
