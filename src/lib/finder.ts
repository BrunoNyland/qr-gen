export const isFinderPattern = (row: number, col: number, mod_count: number, quiet: number): boolean => {
    // Top-Left (quiet, quiet to quiet+6, quiet+6)
    if (row >= quiet && row < quiet + 7 && col >= quiet && col < quiet + 7) {
        return true;
    }
    // Top-Right (quiet, quiet to quiet+6, mod_count-quiet-7 to mod_count-quiet-1)
    if (row >= quiet && row < quiet + 7 && col >= mod_count - quiet - 7 && col < mod_count - quiet) {
        return true;
    }
    // Bottom-Left (mod_count-quiet-7 to mod_count-quiet-1, quiet to quiet+6)
    if (row >= mod_count - quiet - 7 && row < mod_count - quiet && col >= quiet && col < quiet + 7) {
        return true;
    }
    return false;
};

export const isFinderEye = (row: number, col: number, mod_count: number, quiet: number): boolean => {
    // Top-Left eye (quiet+2 to quiet+4, quiet+2 to quiet+4)
    if (row >= quiet + 2 && row <= quiet + 4 && col >= quiet + 2 && col <= quiet + 4) {
        return true;
    }
    // Top-Right eye (quiet+2 to quiet+4, mod_count-quiet-5 to mod_count-quiet-3)
    if (row >= quiet + 2 && row <= quiet + 4 && col >= mod_count - quiet - 5 && col <= mod_count - quiet - 3) {
        return true;
    }
    // Bottom-Left eye (mod_count-quiet-5 to mod_count-quiet-3, quiet+2 to quiet+4)
    if (row >= mod_count - quiet - 5 && row <= mod_count - quiet - 3 && col >= quiet + 2 && col <= quiet + 4) {
        return true;
    }
    return false;
};
