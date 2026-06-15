import * as dom from './dom';
import draw_module_rounded from './draw_rounded';
import draw_mode from './draw_mode';
import {RequiredQrGenOptions, QrGenGradient} from './defaults';
import {QRCodeResult} from './qrcode';
import {isFinderPattern, isFinderEye} from './finder';

const draw_background = (ctx: CanvasRenderingContext2D, settings: RequiredQrGenOptions) => {
    if (settings.back) {
        ctx.fillStyle = settings.back;
        ctx.fillRect(0, 0, settings.size, settings.size);
    }
};

const draw_module_default = (qr: QRCodeResult, ctx: CanvasRenderingContext2D, settings: RequiredQrGenOptions, width: number, row: number, col: number) => {
    if (qr.is_dark(row, col)) {
        ctx.rect(col * width, row * width, width, width);
    }
};

const getFillStyle = (ctx: CanvasRenderingContext2D, fill: string | QrGenGradient, size: number) => {
    if (typeof fill === 'object' && fill !== null) {
        let grad: CanvasGradient;
        if (fill.type === 'linear') {
            const angle = fill.angle || 0;
            const angleRad = (angle - 90) * Math.PI / 180;
            const halfSize = size / 2;
            const cx = halfSize;
            const cy = halfSize;
            const x1 = cx - Math.cos(angleRad) * halfSize;
            const y1 = cy - Math.sin(angleRad) * halfSize;
            const x2 = cx + Math.cos(angleRad) * halfSize;
            const y2 = cy + Math.sin(angleRad) * halfSize;
            grad = ctx.createLinearGradient(x1, y1, x2, y2);
        } else {
            const halfSize = size / 2;
            grad = ctx.createRadialGradient(halfSize, halfSize, 0, halfSize, halfSize, halfSize);
        }
        fill.colors.forEach((c, idx) => {
            grad.addColorStop(idx / (fill.colors.length - 1), c);
        });
        return grad;
    }
    return fill;
};

const draw_eye_shape = (ctx: CanvasRenderingContext2D, shape: string, x: number, y: number, s: number) => {
    if (shape === 'circle') {
        const r = s / 2;
        ctx.moveTo(x + s, y + r);
        ctx.arc(x + r, y + r, r, 0, 2 * Math.PI);
    } else if (shape === 'triangle') {
        ctx.moveTo(x + s / 2, y);
        ctx.lineTo(x + s, y + s);
        ctx.lineTo(x, y + s);
        ctx.closePath();
    } else if (shape === 'diamond') {
        ctx.moveTo(x + s / 2, y);
        ctx.lineTo(x + s, y + s / 2);
        ctx.lineTo(x + s / 2, y + s);
        ctx.lineTo(x, y + s / 2);
        ctx.closePath();
    } else if (shape === 'star') {
        const cx = x + s / 2;
        const cy = y + s / 2;
        const R = s / 2;
        const rInner = s / 4.5;
        for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const currR = i % 2 === 0 ? R : rInner;
            const px = cx + Math.cos(angle) * currR;
            const py = cy + Math.sin(angle) * currR;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
    } else if (shape === 'heart') {
        ctx.moveTo(x + s / 2, y + s * 0.3);
        ctx.bezierCurveTo(x + s * 0.3, y + s * 0.05, x, y + s * 0.1, x, y + s * 0.45);
        ctx.bezierCurveTo(x, y + s * 0.7, x + s * 0.3, y + s * 0.85, x + s / 2, y + s);
        ctx.bezierCurveTo(x + s * 0.7, y + s * 0.85, x + s, y + s * 0.7, x + s, y + s * 0.45);
        ctx.bezierCurveTo(x + s, y + s * 0.1, x + s * 0.7, y + s * 0.05, x + s / 2, y + s * 0.3);
        ctx.closePath();
    } else if (shape === 'rounded') {
        const r = s * 0.25;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + s - r, y);
        ctx.arcTo(x + s, y, x + s, y + s, r);
        ctx.lineTo(x + s, y + s - r);
        ctx.arcTo(x + s, y + s, x, y + s, r);
        ctx.lineTo(x + r, y + s);
        ctx.arcTo(x, y + s, x, y, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + s, y, r);
    } else {
        // square
        ctx.rect(x, y, s, s);
    }
};

const draw_modules = (qr: QRCodeResult | null, ctx: CanvasRenderingContext2D, settings: RequiredQrGenOptions) => {
    if (!qr) {
        return;
    }

    const draw_module = settings.rounded > 0 && settings.rounded <= 100 ? draw_module_rounded : draw_module_default;
    const mod_count = qr.module_count;

    let mod_size = settings.size / mod_count;
    let offset = 0;
    if (settings.crisp) {
        mod_size = Math.floor(mod_size);
        offset = Math.floor((settings.size - mod_size * mod_count) / 2);
    }

    ctx.translate(offset, offset);

    // Pass 1: Draw regular data modules (excluding finder patterns)
    ctx.beginPath();
    for (let row = 0; row < mod_count; row += 1) {
        for (let col = 0; col < mod_count; col += 1) {
            if (!isFinderPattern(row, col, mod_count, settings.quiet)) {
                draw_module(qr, ctx, settings, mod_size, row, col);
            }
        }
    }
    ctx.fillStyle = getFillStyle(ctx, settings.fill, settings.size);
    ctx.fill();

    // Pass 2: Draw finder pattern outer frame modules
    ctx.beginPath();
    const cellSettings = Object.assign({}, settings);
    if (settings.finderShape === 'square') {
        cellSettings.rounded = 0;
    } else if (settings.finderShape === 'circle') {
        cellSettings.rounded = 100;
    }
    const finderDrawModule = cellSettings.rounded > 0 && cellSettings.rounded <= 100 ? draw_module_rounded : draw_module_default;

    for (let row = 0; row < mod_count; row += 1) {
        for (let col = 0; col < mod_count; col += 1) {
            if (isFinderPattern(row, col, mod_count, settings.quiet) && !isFinderEye(row, col, mod_count, settings.quiet)) {
                finderDrawModule(qr, ctx, cellSettings, mod_size, row, col);
            }
        }
    }
    const finderFill = settings.finderColor || settings.fill;
    ctx.fillStyle = getFillStyle(ctx, finderFill, settings.size);
    ctx.fill();

    // Pass 3: Draw finder pattern inner eyes as single custom shapes
    ctx.beginPath();
    const eyeShape = settings.finderEyeShape || settings.finderShape || 'square';
    const eyeSize = 3 * mod_size;
    const quiet = settings.quiet;

    // Top-Left eye
    draw_eye_shape(ctx, eyeShape, (quiet + 2) * mod_size, (quiet + 2) * mod_size, eyeSize);
    // Top-Right eye
    draw_eye_shape(ctx, eyeShape, (mod_count - quiet - 5) * mod_size, (quiet + 2) * mod_size, eyeSize);
    // Bottom-Left eye
    draw_eye_shape(ctx, eyeShape, (quiet + 2) * mod_size, (mod_count - quiet - 5) * mod_size, eyeSize);

    ctx.fillStyle = getFillStyle(ctx, finderFill, settings.size);
    ctx.fill();

    ctx.translate(-offset, -offset);
};

const draw = (qr: QRCodeResult | null, ctx: CanvasRenderingContext2D, settings: RequiredQrGenOptions) => {
    draw_background(ctx, settings);
    draw_modules(qr, ctx, settings);
    draw_mode(ctx, settings);
};

const create_canvas_qrcode = (qr: QRCodeResult | null, settings: RequiredQrGenOptions, as_image: boolean): HTMLCanvasElement | HTMLImageElement => {
    const ratio = settings.ratio || dom.dpr;
    const canvas = dom.create_canvas(settings.size, ratio, settings.canvasFactory);
    const context = canvas.getContext('2d');

    if (context) {
        context.scale(ratio, ratio);
        draw(qr, context, settings);
    }
    return as_image ? dom.canvas_to_img(canvas) : canvas;
};

export default create_canvas_qrcode;
