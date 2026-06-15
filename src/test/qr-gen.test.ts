import {describe, it, expect, beforeAll} from 'vitest';
import {qrGen} from '../qr-gen';
import {isFinderEye} from '../lib/finder';

beforeAll(() => {
    // Mock Canvas 2D context
    const mockCtx = {
        scale: () => {},
        translate: () => {},
        beginPath: () => {},
        rect: () => {},
        fill: () => {},
        fillRect: () => {},
        drawImage: () => {},
        strokeText: () => {},
        fillText: () => {},
        measureText: (text: string) => ({width: text.length * 10}),
        moveTo: () => {},
        lineTo: () => {},
        arcTo: () => {}
    };

    let fillStyle = '';
    let strokeStyle = '';
    let lineWidth = 0;
    let font = '';
    Object.defineProperties(mockCtx, {
        fillStyle: {
            get: () => fillStyle,
            set: val => { fillStyle = val; }
        },
        strokeStyle: {
            get: () => strokeStyle,
            set: val => { strokeStyle = val; }
        },
        lineWidth: {
            get: () => lineWidth,
            set: val => { lineWidth = val; }
        },
        font: {
            get: () => font,
            set: val => { font = val; }
        }
    });

    HTMLCanvasElement.prototype.getContext = function mockGetContext(type: string) {
        if (type === '2d') {
            return mockCtx as any;
        }
        return null;
    };

    HTMLCanvasElement.prototype.toDataURL = function mockToDataURL() {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    };
});

describe('qr-gen QR code generator', () => {
    it('should be a function', () => {
        expect(typeof qrGen).toBe('function');
    });

    it('should default to rendering as an IMG element', () => {
        const res = qrGen({text: 'test'});
        expect(res).toBeInstanceOf(window.HTMLElement);
        expect(res.tagName.toUpperCase()).toBe('IMG');

        const img = res as HTMLImageElement;
        expect(img.getAttribute('crossOrigin')).toBe('anonymous');
        expect(img.getAttribute('src')).toContain('data:image/png;base64,');
    });

    it('should render as a CANVAS element when requested', () => {
        const res = qrGen({render: 'canvas', text: 'test'});
        expect(res).toBeInstanceOf(window.HTMLElement);
        expect(res.tagName.toUpperCase()).toBe('CANVAS');
    });

    it('should render as an SVG element when requested', () => {
        const res = qrGen({render: 'svg', text: 'test'});
        expect(res).toBeInstanceOf(window.SVGElement);
        expect(res.tagName.toLowerCase()).toBe('svg');

        const rects = res.querySelectorAll('rect');
        expect(rects.length).toBeGreaterThanOrEqual(1);

        const paths = res.querySelectorAll('path');
        expect(paths.length).toBe(3);
    });

    it('should apply rounded corners if requested', () => {
        const res = qrGen({render: 'svg', text: 'test', rounded: 50});
        const path = res.querySelector('path');
        expect(path).not.toBeNull();
        expect(path?.getAttribute('d')).toContain('A');
    });

    it('should embed label if requested', () => {
        const res = qrGen({render: 'svg', text: 'test', mode: 'label', label: 'hello'});
        const text = res.querySelector('text');
        expect(text).not.toBeNull();
        expect(text?.textContent).toBe('hello');
    });

    it('should load image from URL asynchronously and update rendering', async () => {
        const res = qrGen({
            render: 'canvas',
            text: 'test',
            mode: 'image',
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        });
        expect(res).toBeInstanceOf(window.HTMLElement);
        expect(res.tagName.toUpperCase()).toBe('CANVAS');

        await new Promise(resolve => setTimeout(resolve, 50));
    });

    it('should generate a condensed SVG path', () => {
        const res = qrGen({render: 'svg', text: 'test'});
        const path = res.querySelector('path');
        expect(path).not.toBeNull();
        const d = path?.getAttribute('d') || '';
        expect(d).not.toContain('M ');
        expect(d).not.toContain('L ');
    });

    it('should inject linear and radial gradients in SVG when requested', () => {
        const resLinear = qrGen({
            render: 'svg',
            text: 'test',
            fill: {
                type: 'linear',
                colors: ['#ff0000', '#0000ff'],
                angle: 45
            }
        });
        const linearGrad = resLinear.querySelector('linearGradient');
        expect(linearGrad).not.toBeNull();
        expect(linearGrad?.id).toContain('qrgen-grad-fill');
        expect(linearGrad?.getAttribute('x1')).toBeDefined();
        const stops = linearGrad?.querySelectorAll('stop');
        expect(stops?.length).toBe(2);
        expect(stops?.[0].getAttribute('stop-color')).toBe('#ff0000');
        expect(stops?.[1].getAttribute('stop-color')).toBe('#0000ff');

        const resRadial = qrGen({
            render: 'svg',
            text: 'test',
            fill: {
                type: 'radial',
                colors: ['#ffffff', '#000000']
            }
        });
        const radialGrad = resRadial.querySelector('radialGradient');
        expect(radialGrad).not.toBeNull();
        expect(radialGrad?.id).toContain('qrgen-grad-fill');
        const radialStops = radialGrad?.querySelectorAll('stop');
        expect(radialStops?.length).toBe(2);
    });

    it('should support custom finder shape and color configurations', () => {
        const resCircle = qrGen({
            render: 'svg',
            text: 'test',
            finderShape: 'circle',
            finderColor: '#ff00ff'
        });
        const paths = resCircle.querySelectorAll('path');
        expect(paths.length).toBe(3);
        expect(paths[1].getAttribute('fill')).toBe('#ff00ff');

        const resFinderGrad = qrGen({
            render: 'svg',
            text: 'test',
            finderShape: 'square',
            finderColor: {
                type: 'linear',
                colors: ['#00ff00', '#ffff00']
            }
        });
        const finderGrad = resFinderGrad.querySelector('linearGradient');
        expect(finderGrad).not.toBeNull();
        expect(finderGrad?.id).toContain('qrgen-grad-finder');
    });

    it('should export SVG as string using toSVGString', () => {
        const svgStr = qrGen.toSVGString({text: 'test'});
        expect(typeof svgStr).toBe('string');
        expect(svgStr).toContain('<svg');
        expect(svgStr).toContain('xmlns="http://www.w3.org/2000/svg"');
        expect(svgStr).toContain('</svg>');
    });

    it('should export Canvas as DataURL using toDataURL', () => {
        const dataUrl = qrGen.toDataURL({text: 'test'});
        expect(typeof dataUrl).toBe('string');
        expect(dataUrl).toContain('data:image/png;base64,');
    });

    it('should support custom canvasFactory', () => {
        let customCanvasCreated = false;
        const mockCanvas = {
            getContext: () => ({
                scale: () => {},
                translate: () => {},
                beginPath: () => {},
                rect: () => {},
                fill: () => {},
                fillRect: () => {},
                toDataURL: () => 'data:image/png;base64,mock'
            })
        };
        const customCanvasFactory = () => {
            customCanvasCreated = true;
            return mockCanvas;
        };
        const res = qrGen({
            render: 'canvas',
            text: 'test',
            canvasFactory: customCanvasFactory
        });
        expect(customCanvasCreated).toBe(true);
        expect(res).toBe(mockCanvas as any);
    });

    it('should correctly identify cells inside isFinderEye', () => {
        expect(isFinderEye(1, 1, 23, 1)).toBe(false);
        expect(isFinderEye(3, 3, 23, 1)).toBe(true);
        expect(isFinderEye(3, 17, 23, 1)).toBe(true);
        expect(isFinderEye(17, 3, 23, 1)).toBe(true);
    });

    it('should render custom finder eye shapes (star, heart, triangle) in SVG', () => {
        const res = qrGen({
            render: 'svg',
            text: 'test',
            finderEyeShape: 'heart'
        });
        const paths = res.querySelectorAll('path');
        expect(paths.length).toBe(3);
        const eyePath = paths[2].getAttribute('d') || '';
        expect(eyePath).toContain('C');
    });
});
