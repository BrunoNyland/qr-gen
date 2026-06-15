import qr_gen from 'qrcode-generator';

const RE_CODE_LENGTH_OVERFLOW = /code length overflow/i;

// Configure UTF-8 encoding using native TextEncoder
qr_gen.stringToBytes = (str: string): number[] => {
    return Array.from(new TextEncoder().encode(str));
};

export interface QRCodeResult {
    text: string;
    level: string;
    version: number;
    module_count: number;
    is_dark: (row: number, col: number) => boolean;
}

const min_qrcode = (text: string, level: string, min_ver: number = 1): QRCodeResult | null => {
    const start_ver = Math.max(1, min_ver);

    for (let version = start_ver; version <= 40; version += 1) {
        try {
            const qr = qr_gen(version as any, level as any);
            qr.addData(text);
            qr.make();
            const module_count = qr.getModuleCount();
            const is_dark = (row: number, col: number) => {
                return row >= 0 &&
                    row < module_count &&
                    col >= 0 &&
                    col < module_count &&
                    qr.isDark(row, col);
            };
            return {text, level, version, module_count, is_dark};
        } catch (err: any) {
            const errMsg = err instanceof Error ? err.message : String(err);
            if (!(version < 40 && RE_CODE_LENGTH_OVERFLOW.test(errMsg))) {
                throw err instanceof Error ? err : new Error(errMsg);
            }
        }
    }
    return null;
};

const quiet_qrcode = (text: string = '', level: string = 'L', min_ver: number = 1, quiet: number = 0): QRCodeResult | null => {
    const qr = min_qrcode(text, level, min_ver);
    if (qr) {
        const prev_is_dark = qr.is_dark;
        qr.module_count += 2 * quiet;
        qr.is_dark = (row: number, col: number) => prev_is_dark(row - quiet, col - quiet);
    }
    return qr;
};

export default quiet_qrcode;
