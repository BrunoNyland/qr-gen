import {defaults, QrGenOptions, RequiredQrGenOptions} from './lib/defaults';
import qrcode from './lib/qrcode';
import create_canvas_qrcode from './lib/create_canvas_qrcode';
import create_svg_qrcode from './lib/create_svg_qrcode';
import draw_mode from './lib/draw_mode';

interface QrGenFn {
    (options?: QrGenOptions): HTMLElement | SVGElement;
    toSVGString(options?: QrGenOptions): string;
    toDataURL(options?: QrGenOptions): string;
}

export const qrGen: QrGenFn = (() => {
    const fn = (options?: QrGenOptions): HTMLElement | SVGElement => {
        const settings = Object.assign({}, defaults, options) as RequiredQrGenOptions;

        const imageUrl = typeof settings.image === 'string' ? settings.image : null;
        if (imageUrl) {
            settings.image = null;
        }

        const qr = qrcode(settings.text, settings.ecLevel, settings.minVersion, settings.quiet);

        const resultEl = settings.render === 'svg'
            ? create_svg_qrcode(qr, settings)
            : create_canvas_qrcode(qr, settings, settings.render === 'image');

        if (imageUrl && typeof window !== 'undefined') {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                settings.image = img;

                if (resultEl instanceof HTMLCanvasElement) {
                    const ctx = resultEl.getContext('2d');
                    if (ctx) {
                        draw_mode(ctx, settings);
                    }
                } else if (resultEl instanceof HTMLImageElement) {
                    const newCanvas = create_canvas_qrcode(qr, settings, false) as HTMLCanvasElement;
                    resultEl.src = newCanvas.toDataURL('image/png');
                } else if (resultEl instanceof SVGElement) {
                    const newSvg = create_svg_qrcode(qr, settings) as SVGElement;
                    while (resultEl.firstChild) {
                        resultEl.removeChild(resultEl.firstChild);
                    }
                    while (newSvg.firstChild) {
                        resultEl.appendChild(newSvg.firstChild);
                    }
                }
            };
            img.src = imageUrl;
        }

        return resultEl;
    };

    fn.toSVGString = (options?: QrGenOptions): string => {
        const settings = Object.assign({}, options, {render: 'svg'}) as QrGenOptions;
        const el = fn(settings);
        if (el instanceof SVGElement) {
            return el.outerHTML || new XMLSerializer().serializeToString(el);
        }
        return '';
    };

    fn.toDataURL = (options?: QrGenOptions): string => {
        const settings = Object.assign({}, options, {render: 'canvas'}) as QrGenOptions;
        const el = fn(settings);
        if (el instanceof HTMLCanvasElement) {
            return el.toDataURL('image/png');
        }
        return '';
    };

    return fn;
})();

export default qrGen;

declare global {
    interface Window {
        qrGen?: typeof qrGen;
    }
}

if (typeof window !== 'undefined') {
    window.qrGen = qrGen;
}
