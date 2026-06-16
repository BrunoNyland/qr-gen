import {SVG_NS, get_attr, create_svg_el, measure_text_width} from './dom';
import {RequiredQrGenOptions, QrGenGradient} from './defaults';
import {QRCodeResult} from './qrcode';
import {isFinderPattern, isFinderEye} from './finder';

const get_eye_path = (shape: string, x: number, y: number, s: number): string => {
    const rndVal = (val: number) => Math.round(val * 10) / 10;
    if (shape === 'circle') {
        const r = rndVal(s / 2);
        const cx = rndVal(x + s / 2);
        const cy = rndVal(y + s / 2);
        return `M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy} A${r},${r} 0 0 1 ${cx - r},${cy} Z`;
    } else if (shape === 'triangle') {
        return `M${rndVal(x + s / 2)},${rndVal(y + s * 0.05)} L${rndVal(x + s * 0.85)},${rndVal(y + s * 0.75)} L${rndVal(x + s * 0.15)},${rndVal(y + s * 0.75)} Z`;
    } else if (shape === 'diamond') {
        return `M${rndVal(x + s / 2)},${rndVal(y)} L${rndVal(x + s)},${rndVal(y + s / 2)} L${rndVal(x + s / 2)},${rndVal(y + s)} L${rndVal(x)},${rndVal(y + s / 2)} Z`;
    } else if (shape === 'star') {
        const cx = x + s / 2;
        const cy = y + s / 2;
        const R = s / 2;
        const rInner = s / 4.5;
        let pathStr = '';
        for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const currR = i % 2 === 0 ? R : rInner;
            const px = rndVal(cx + Math.cos(angle) * currR);
            const py = rndVal(cy + Math.sin(angle) * currR);
            if (i === 0) {
                pathStr += `M${px},${py}`;
            } else {
                pathStr += ` L${px},${py}`;
            }
        }
        return pathStr + ' Z';
    } else if (shape === 'heart') {
        return `M${rndVal(x + s / 2)},${rndVal(y + s * 0.3)} C${rndVal(x + s * 0.3)},${rndVal(y + s * 0.05)},${rndVal(x)},${rndVal(y + s * 0.1)},${rndVal(x)},${rndVal(y + s * 0.45)} C${rndVal(x)},${rndVal(y + s * 0.7)},${rndVal(x + s * 0.3)},${rndVal(y + s * 0.85)},${rndVal(x + s / 2)},${rndVal(y + s)} C${rndVal(x + s * 0.7)},${rndVal(y + s * 0.85)},${rndVal(x + s)},${rndVal(y + s * 0.7)},${rndVal(x + s)},${rndVal(y + s * 0.45)} C${rndVal(x + s)},${rndVal(y + s * 0.1)},${rndVal(x + s * 0.7)},${rndVal(y + s * 0.05)},${rndVal(x + s / 2)},${rndVal(y + s * 0.3)} Z`;
    } else if (shape === 'rounded') {
        const r = rndVal(s * 0.25);
        return `M${rndVal(x + r)},${rndVal(y)} L${rndVal(x + s - r)},${rndVal(y)} A${r},${r} 0 0 1 ${rndVal(x + s)},${rndVal(y + r)} L${rndVal(x + s)},${rndVal(y + s - r)} A${r},${r} 0 0 1 ${rndVal(x + s - r)},${rndVal(y + s)} L${rndVal(x + r)},${rndVal(y + s)} A${r},${r} 0 0 1 ${rndVal(x)},${rndVal(y + s - r)} L${rndVal(x)},${rndVal(y + r)} A${r},${r} 0 0 1 ${rndVal(x + r)},${rndVal(y)} Z`;
    } else {
        return `M${rndVal(x)},${rndVal(y)} L${rndVal(x + s)},${rndVal(y)} L${rndVal(x + s)},${rndVal(y + s)} L${rndVal(x)},${rndVal(y + s)} Z`;
    }
};

interface PathContext {
    p: string;
    o: number;
}

const rnd = (x: number) => Math.round(x * 10) / 10;
const rndo = (x: number, o: number) => Math.round(x * 10) / 10 + o;

const draw_dark = (ctx: PathContext, l: number, t: number, r: number, b: number, rad: number, nw: boolean, ne: boolean, se: boolean, sw: boolean) => {
    const o = ctx.o;
    if (nw) {
        ctx.p += `M${rndo(l + rad, o)},${rndo(t, o)}`;
    } else {
        ctx.p += `M${rndo(l, o)},${rndo(t, o)}`;
    }

    if (ne) {
        ctx.p += `L${rndo(r - rad, o)},${rndo(t, o)}A${rnd(rad)},${rnd(rad)} 0 0 1 ${rndo(r, o)},${rndo(t + rad, o)}`;
    } else {
        ctx.p += `L${rndo(r, o)},${rndo(t, o)}`;
    }

    if (se) {
        ctx.p += `L${rndo(r, o)},${rndo(b - rad, o)}A${rnd(rad)},${rnd(rad)} 0 0 1 ${rndo(r - rad, o)},${rndo(b, o)}`;
    } else {
        ctx.p += `L${rndo(r, o)},${rndo(b, o)}`;
    }

    if (sw) {
        ctx.p += `L${rndo(l + rad, o)},${rndo(b, o)}A${rnd(rad)},${rnd(rad)} 0 0 1 ${rndo(l, o)},${rndo(b - rad, o)}`;
    } else {
        ctx.p += `L${rndo(l, o)},${rndo(b, o)}`;
    }

    if (nw) {
        ctx.p += `L${rndo(l, o)},${rndo(t + rad, o)}A${rnd(rad)},${rnd(rad)} 0 0 1 ${rndo(l + rad, o)},${rndo(t, o)}`;
    } else {
        ctx.p += `L${rndo(l, o)},${rndo(t, o)}`;
    }
};

const draw_light = (ctx: PathContext, l: number, t: number, r: number, b: number, rad: number, nw: boolean, ne: boolean, se: boolean, sw: boolean) => {
    const o = ctx.o;
    if (nw) {
        ctx.p += `M${rndo(l + rad, o)},${rndo(t, o)}L${rndo(l, o)},${rndo(t, o)}L${rndo(l, o)},${rndo(t + rad, o)}A${rnd(rad)},${rnd(rad)} 0 0 1 ${rndo(l + rad, o)},${rndo(t, o)}`;
    }

    if (ne) {
        ctx.p += `M${rndo(r, o)},${rndo(t + rad, o)}L${rndo(r, o)},${rndo(t, o)}L${rndo(r - rad, o)},${rndo(t, o)}A${rnd(rad)},${rnd(rad)} 0 0 1 ${rndo(r, o)},${rndo(t + rad, o)}`;
    }

    if (se) {
        ctx.p += `M${rndo(r - rad, o)},${rndo(b, o)}L${rndo(r, o)},${rndo(b, o)}L${rndo(r, o)},${rndo(b - rad, o)}A${rnd(rad)},${rnd(rad)} 0 0 1 ${rndo(r - rad, o)},${rndo(b, o)}`;
    }

    if (sw) {
        ctx.p += `M${rndo(l, o)},${rndo(b - rad, o)}L${rndo(l, o)},${rndo(b, o)}L${rndo(l + rad, o)},${rndo(b, o)}A${rnd(rad)},${rnd(rad)} 0 0 1 ${rndo(l, o)},${rndo(b - rad, o)}`;
    }
};

const draw_mod = (qr: QRCodeResult, ctx: PathContext, settings: RequiredQrGenOptions, width: number, row: number, col: number) => {
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

const create_path = (qr: QRCodeResult | null, settings: RequiredQrGenOptions, drawFinder: boolean): string => {
    if (!qr) {
        return '';
    }

    const ctx: PathContext = {p: '', o: 0};
    const mod_count = qr.module_count;
    let mod_size = settings.size / mod_count;
    if (settings.crisp) {
        mod_size = Math.floor(mod_size);
        ctx.o = Math.floor((settings.size - mod_size * mod_count) / 2);
    }

    if (drawFinder && settings.finderShape === 'circle') {
        const offset = ctx.o;
        const quiet = settings.quiet;
        const finders = [
            {col: quiet, row: quiet},
            {col: mod_count - quiet - 7, row: quiet},
            {col: quiet, row: mod_count - quiet - 7}
        ];
        let pathStr = '';
        finders.forEach(f => {
            const x_start = offset + f.col * mod_size;
            const y_start = offset + f.row * mod_size;

            const r_out = rnd(3.5 * mod_size);
            const r_in = rnd(2.5 * mod_size);
            const cx = rnd(x_start + 3.5 * mod_size);
            const cy = rnd(y_start + 3.5 * mod_size);

            // Outer circle (clockwise): two semi-circles
            pathStr += `M${cx - r_out},${cy} A${r_out},${r_out} 0 0 1 ${cx + r_out},${cy} A${r_out},${r_out} 0 0 1 ${cx - r_out},${cy} Z`;
            // Inner circle (counter-clockwise): two semi-circles
            pathStr += ` M${cx - r_in},${cy} A${r_in},${r_in} 0 0 0 ${cx + r_in},${cy} A${r_in},${r_in} 0 0 0 ${cx - r_in},${cy} Z `;
        });
        return pathStr.trim();
    }

    const cellSettings = Object.assign({}, settings);
    if (drawFinder) {
        if (settings.finderShape === 'square') {
            cellSettings.rounded = 0;
        }
    }

    for (let row = 0; row < mod_count; row += 1) {
        for (let col = 0; col < mod_count; col += 1) {
            const is_finder = isFinderPattern(row, col, mod_count, settings.quiet);
            const is_eye = isFinderEye(row, col, mod_count, settings.quiet);
            if (drawFinder) {
                if (is_finder && !is_eye) {
                    draw_mod(qr, ctx, cellSettings, mod_size, row, col);
                }
            } else {
                if (!is_finder) {
                    draw_mod(qr, ctx, cellSettings, mod_size, row, col);
                }
            }
        }
    }

    return ctx.p;
};

const buildSvgGradient = (fill: QrGenGradient, id: string): SVGElement => {
    const isLinear = fill.type === 'linear';
    const tag = isLinear ? 'linearGradient' : 'radialGradient';
    const attrs: Record<string, any> = {id};

    if (isLinear) {
        const angle = fill.angle || 0;
        const angleRad = (angle - 90) * Math.PI / 180;
        const x1 = Math.round(50 - Math.cos(angleRad) * 50);
        const y1 = Math.round(50 - Math.sin(angleRad) * 50);
        const x2 = Math.round(50 + Math.cos(angleRad) * 50);
        const y2 = Math.round(50 + Math.sin(angleRad) * 50);

        Object.assign(attrs, {
            x1: `${x1}%`,
            y1: `${y1}%`,
            x2: `${x2}%`,
            y2: `${y2}%`
        });
    } else {
        Object.assign(attrs, {
            cx: '50%',
            cy: '50%',
            r: '50%',
            fx: '50%',
            fy: '50%'
        });
    }

    const gradEl = create_svg_el(tag, attrs);
    fill.colors.forEach((c, idx) => {
        const offset = Math.round((idx / (fill.colors.length - 1)) * 100);
        const stopEl = create_svg_el('stop', {
            offset: `${offset}%`,
            'stop-color': c
        });
        gradEl.appendChild(stopEl);
    });
    return gradEl;
};

const add_label = (el: SVGElement, settings: RequiredQrGenOptions) => {
    const size = settings.size;
    const font = 'bold ' + settings.mSize * 0.01 * size + 'px ' + settings.fontname;

    const w = measure_text_width(settings.label, font);

    const sh = settings.mSize * 0.01;
    const sw = w / size;
    const sl = (1 - sw) * settings.mPosX * 0.01;
    const st = (1 - sh) * settings.mPosY * 0.01;
    const x = sl * size;
    const y = st * size + 0.75 * settings.mSize * 0.01 * size;

    const text_el = create_svg_el('text', {
        x,
        y
    }) as SVGTextElement;

    const strokeWidth = settings.mSize * 0.01 * size * (settings.labelStrokeWidth || 0.1);
    Object.assign(text_el.style, {
        font,
        fill: settings.fontcolor,
        'paint-order': 'stroke',
        stroke: settings.labelStrokeColor || settings.back || '#fff',
        'stroke-width': `${strokeWidth}px`
    });

    text_el.textContent = settings.label;
    el.appendChild(text_el);
};

const add_image = (el: SVGElement, settings: RequiredQrGenOptions) => {
    if (!(settings.image instanceof HTMLImageElement)) {
        return;
    }
    const size = settings.size;
    const w = settings.image.naturalWidth || 1;
    const h = settings.image.naturalHeight || 1;
    const sh = settings.mSize * 0.01;
    const sw = sh * w / h;
    const sl = (1 - sw) * settings.mPosX * 0.01;
    const st = (1 - sh) * settings.mPosY * 0.01;
    const x = sl * size;
    const y = st * size;
    const iw = sw * size;
    const ih = sh * size;

    const img_el = create_svg_el('image', {
        href: get_attr(settings.image, 'src') || '',
        x,
        y,
        width: iw,
        height: ih
    });
    el.appendChild(img_el);
};

const create_svg_qrcode = (qr: QRCodeResult | null, settings: RequiredQrGenOptions): SVGElement => {
    const size = settings.size;
    const mode = settings.mode;

    const svg_el = create_svg_el('svg', {
        xmlns: SVG_NS,
        width: size,
        height: size,
        viewBox: `0 0 ${size} ${size}`
    });
    svg_el.style.width = `${size}px`;
    svg_el.style.height = `${size}px`;

    const defsEl = create_svg_el('defs');
    let hasDefs = false;

    let fillAttr = '';
    if (typeof settings.fill === 'object' && settings.fill !== null) {
        const gradId = `qrgen-grad-fill-${Math.random().toString(36).substring(2, 9)}`;
        const gradEl = buildSvgGradient(settings.fill, gradId);
        defsEl.appendChild(gradEl);
        hasDefs = true;
        fillAttr = `url(#${gradId})`;
    } else {
        fillAttr = settings.fill;
    }

    let finderFillAttr = '';
    const finderColor = settings.finderColor || settings.fill;
    if (typeof finderColor === 'object' && finderColor !== null) {
        const gradId = `qrgen-grad-finder-${Math.random().toString(36).substring(2, 9)}`;
        const gradEl = buildSvgGradient(finderColor, gradId);
        defsEl.appendChild(gradEl);
        hasDefs = true;
        finderFillAttr = `url(#${gradId})`;
    } else {
        finderFillAttr = finderColor as string;
    }

    if (hasDefs) {
        svg_el.appendChild(defsEl);
    }

    if (settings.back) {
        svg_el.appendChild(create_svg_el('rect', {
            x: 0,
            y: 0,
            width: size,
            height: size,
            fill: settings.back
        }));
    }

    // Path 1: Regular modules path
    svg_el.appendChild(create_svg_el('path', {
        d: create_path(qr, settings, false),
        fill: fillAttr
    }));

    // Path 2: Finder patterns path
    svg_el.appendChild(create_svg_el('path', {
        d: create_path(qr, settings, true),
        fill: finderFillAttr
    }));

    // Path 3: Finder eyes path
    const eyeShape = settings.finderEyeShape || settings.finderShape || 'square';
    let eyePathD = '';
    const mod_count = qr ? qr.module_count : 0;
    if (qr) {
        let mod_size = settings.size / mod_count;
        let offset = 0;
        if (settings.crisp) {
            mod_size = Math.floor(mod_size);
            offset = Math.floor((settings.size - mod_size * mod_count) / 2);
        }
        const eyeSize = 3 * mod_size;
        const quiet = settings.quiet;

        eyePathD += get_eye_path(eyeShape, offset + (quiet + 2) * mod_size, offset + (quiet + 2) * mod_size, eyeSize);
        eyePathD += ' ' + get_eye_path(eyeShape, offset + (mod_count - quiet - 5) * mod_size, offset + (quiet + 2) * mod_size, eyeSize);
        eyePathD += ' ' + get_eye_path(eyeShape, offset + (quiet + 2) * mod_size, offset + (mod_count - quiet - 5) * mod_size, eyeSize);
    }

    svg_el.appendChild(create_svg_el('path', {
        d: eyePathD.trim(),
        fill: finderFillAttr
    }));

    if (mode === 'label') {
        add_label(svg_el, settings);
    } else if (mode === 'image') {
        add_image(svg_el, settings);
    }

    return svg_el;
};

export default create_svg_qrcode;
