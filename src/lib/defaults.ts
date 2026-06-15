export interface QrGenGradient {
    type: 'linear' | 'radial';
    colors: string[];
    angle?: number;
}

export interface QrGenOptions {
    render?: 'canvas' | 'image' | 'svg';
    crisp?: boolean;
    minVersion?: number;
    ecLevel?: 'L' | 'M' | 'Q' | 'H';
    size?: number;
    ratio?: number | null;
    fill?: string | QrGenGradient;
    back?: string | null;
    text?: string;
    rounded?: number;
    quiet?: number;
    mode?: 'plain' | 'label' | 'image';
    mSize?: number;
    mPosX?: number;
    mPosY?: number;
    label?: string;
    fontname?: string;
    fontcolor?: string;
    labelStrokeColor?: string;
    labelStrokeWidth?: number;
    image?: HTMLImageElement | string | null;
    finderShape?: 'square' | 'circle' | 'rounded';
    finderColor?: string | QrGenGradient | null;
    finderEyeShape?: 'square' | 'circle' | 'rounded' | 'triangle' | 'heart' | 'star' | 'diamond' | null;
    canvasFactory?: ((width: number, height: number) => any) | null;
}

export type RequiredQrGenOptions = Required<Omit<QrGenOptions, 'ratio' | 'image' | 'back' | 'finderShape' | 'finderColor' | 'finderEyeShape' | 'canvasFactory'>> & {
    ratio: number | null;
    image: HTMLImageElement | string | null;
    back: string | null;
    finderShape: 'square' | 'circle' | 'rounded' | null;
    finderColor: string | QrGenGradient | null;
    finderEyeShape: 'square' | 'circle' | 'rounded' | 'triangle' | 'heart' | 'star' | 'diamond' | null;
    canvasFactory: ((width: number, height: number) => any) | null;
};

export const defaults: RequiredQrGenOptions = {
    render: 'image',
    crisp: true,
    minVersion: 1,
    ecLevel: 'L',
    size: 200,
    ratio: null,
    fill: '#333',
    back: '#fff',
    text: 'no text',
    rounded: 0,
    quiet: 0,
    mode: 'plain',
    mSize: 30,
    mPosX: 50,
    mPosY: 50,
    label: 'no label',
    fontname: 'sans',
    fontcolor: '#333',
    labelStrokeColor: '#fff',
    labelStrokeWidth: 0.1,
    image: null,
    finderShape: null,
    finderColor: null,
    finderEyeShape: null,
    canvasFactory: null
};
