/**
 * @name renderChunks
 * @type function
 * @description this function will render chunks separately
 *
 * @author amalmohann
 */
function renderChunks(deps: Record<string, string>) {
    const chunks: any = {};
    Object.keys(deps).forEach(key => {
        if (['@lightningjs/sdk'].includes(key)) return;
        chunks[key] = [key];
    });
    return chunks;
}

export { renderChunks };
