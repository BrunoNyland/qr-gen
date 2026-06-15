const win = typeof window !== 'undefined' ? window : null;
const doc = win ? win.document : null;
export const dpr = win ? win.devicePixelRatio || 1 : 1;

export const SVG_NS = 'http://www.w3.org/2000/svg';

export const get_attr = (el: Element, key: string) => el.getAttribute(key);

export const set_attrs = <T extends Element>(el: T, obj?: Record<string, any>): T => {
    Object.keys(obj || {}).forEach(key => {
        if (obj && obj[key] !== undefined && obj[key] !== null) {
            el.setAttribute(key, String(obj[key]));
        }
    });
    return el;
};

export const create_el = <K extends keyof HTMLElementTagNameMap>(name: K, obj?: Record<string, any>): HTMLElementTagNameMap[K] => {
    if (!doc) {
        throw new Error('DOM is not available');
    }
    return set_attrs(doc.createElement(name), obj);
};

export const create_svg_el = (name: string, obj?: Record<string, any>): SVGElement => {
    if (!doc) {
        throw new Error('DOM is not available');
    }
    return set_attrs(doc.createElementNS(SVG_NS, name), obj) as SVGElement;
};

export const create_canvas = (size: number, ratio: number, canvasFactory?: ((width: number, height: number) => any) | null): HTMLCanvasElement => {
    if (canvasFactory) {
        return canvasFactory(size * ratio, size * ratio) as HTMLCanvasElement;
    }
    const canvas = create_el('canvas', {
        width: size * ratio,
        height: size * ratio
    });
    if (canvas.style) {
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
    }
    return canvas;
};

export const canvas_to_img = (canvas: HTMLCanvasElement): HTMLImageElement => {
    const img = create_el('img', {
        crossOrigin: 'anonymous',
        src: canvas.toDataURL('image/png'),
        width: get_attr(canvas, 'width'),
        height: get_attr(canvas, 'height')
    });
    img.style.width = canvas.style.width;
    img.style.height = canvas.style.height;
    return img;
};

let sharedCanvas: HTMLCanvasElement | null = null;

export const measure_text_width = (text: string, font: string): number => {
    if (!doc) {
        return text.length * 10;
    }
    if (!sharedCanvas) {
        sharedCanvas = doc.createElement('canvas');
    }
    const ctx = sharedCanvas.getContext('2d');
    if (!ctx) {
        return text.length * 10;
    }
    ctx.font = font;
    return ctx.measureText(text).width;
};
