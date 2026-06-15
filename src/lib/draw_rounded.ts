import {RequiredQrGenOptions} from './defaults';
import {QRCodeResult} from './qrcode';

const draw_dark = (ctx: CanvasRenderingContext2D, l: number, t: number, r: number, b: number, rad: number, nw: boolean, ne: boolean, se: boolean, sw: boolean) => {
    if (nw) {
        ctx.moveTo(l + rad, t);
    } else {
        ctx.moveTo(l, t);
    }

    if (ne) {
        ctx.lineTo(r - rad, t);
        ctx.arcTo(r, t, r, b, rad);
    } else {
        ctx.lineTo(r, t);
    }

    if (se) {
        ctx.lineTo(r, b - rad);
        ctx.arcTo(r, b, l, b, rad);
    } else {
        ctx.lineTo(r, b);
    }

    if (sw) {
        ctx.lineTo(l + rad, b);
        ctx.arcTo(l, b, l, t, rad);
    } else {
        ctx.lineTo(l, b);
    }

    if (nw) {
        ctx.lineTo(l, t + rad);
        ctx.arcTo(l, t, r, t, rad);
    } else {
        ctx.lineTo(l, t);
    }
};

const draw_light = (ctx: CanvasRenderingContext2D, l: number, t: number, r: number, b: number, rad: number, nw: boolean, ne: boolean, se: boolean, sw: boolean) => {
    if (nw) {
        ctx.moveTo(l + rad, t);
        ctx.lineTo(l, t);
        ctx.lineTo(l, t + rad);
        ctx.arcTo(l, t, l + rad, t, rad);
    }

    if (ne) {
        ctx.moveTo(r - rad, t);
        ctx.lineTo(r, t);
        ctx.lineTo(r, t + rad);
        ctx.arcTo(r, t, r - rad, t, rad);
    }

    if (se) {
        ctx.moveTo(r - rad, b);
        ctx.lineTo(r, b);
        ctx.lineTo(r, b - rad);
        ctx.arcTo(r, b, r - rad, b, rad);
    }

    if (sw) {
        ctx.moveTo(l + rad, b);
        ctx.lineTo(l, b);
        ctx.lineTo(l, b - rad);
        ctx.arcTo(l, b, l + rad, b, rad);
    }
};

const draw_module_rounded = (qr: QRCodeResult, ctx: CanvasRenderingContext2D, settings: RequiredQrGenOptions, width: number, row: number, col: number) => {
    const left = col * width;
    const top = row * width;
    const right = left + width;
    const bottom = top + width;
    const radius = settings.rounded * 0.005 * width;

    const is_dark = qr.is_dark;
    const row_n = row - 1;
    const row_s = row + 1;
    const col_w = col - 1;
    const col_e = col + 1;
    const dark_center = is_dark(row, col);
    const dark_nw = is_dark(row_n, col_w);
    const dark_n = is_dark(row_n, col);
    const dark_ne = is_dark(row_n, col_e);
    const dark_e = is_dark(row, col_e);
    const dark_se = is_dark(row_s, col_e);
    const dark_s = is_dark(row_s, col);
    const dark_sw = is_dark(row_s, col_w);
    const dark_w = is_dark(row, col_w);

    if (dark_center) {
        draw_dark(ctx, left, top, right, bottom, radius, !dark_n && !dark_w, !dark_n && !dark_e, !dark_s && !dark_e, !dark_s && !dark_w);
    } else {
        draw_light(ctx, left, top, right, bottom, radius, dark_n && dark_w && dark_nw, dark_n && dark_e && dark_ne, dark_s && dark_e && dark_se, dark_s && dark_w && dark_sw);
    }
};

export default draw_module_rounded;
