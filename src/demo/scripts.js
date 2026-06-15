(function initDemo() {
    const win = window;
    const doc = win.document;
    const qrGen = win.qrGen;

    const rangeInputs = ['size', 'rounded', 'quiet', 'minversion', 'msize', 'mposx', 'mposy', 'grad-angle'];

    function elById(id) {
        return doc.getElementById(id);
    }

    function valById(id) {
        const el = elById(id);
        return el ? el.value : '';
    }

    function intById(id) {
        return parseInt(valById(id), 10);
    }

    function updateLabels() {
        rangeInputs.forEach(id => {
            const valEl = elById('val-' + id);
            if (valEl) {
                valEl.textContent = valById(id);
            }
        });
    }

    function toggleFields() {
        const mode = valById('mode');
        const labelFields = doc.querySelector('.overlay-fields-label');
        const imgFields = doc.querySelector('.overlay-fields-image');
        const sharedFields = doc.querySelector('.overlay-shared');

        if (mode === 'plain') {
            labelFields.style.display = 'none';
            imgFields.style.display = 'none';
            sharedFields.style.display = 'none';
        } else if (mode === 'label') {
            labelFields.style.display = 'block';
            imgFields.style.display = 'none';
            sharedFields.style.display = 'block';
        } else if (mode === 'image') {
            labelFields.style.display = 'none';
            imgFields.style.display = 'block';
            sharedFields.style.display = 'block';
        }

        // Gradients
        const useGrad = elById('use-gradient').checked;
        const gradFields = doc.querySelector('.gradient-fields');
        gradFields.style.display = useGrad ? 'block' : 'none';

        if (useGrad) {
            const gradType = valById('grad-type');
            const angleRow = doc.querySelector('.grad-angle-row');
            angleRow.style.display = gradType === 'linear' ? 'block' : 'none';
        }

        // Finder color
        const useFinderColor = elById('use-finder-color').checked;
        const finderColorFields = doc.querySelector('.finder-color-fields');
        finderColorFields.style.display = useFinderColor ? 'block' : 'none';
    }

    function getQrcodeOptions(renderModeOverride) {
        const mode = valById('mode');
        const renderMode = renderModeOverride || valById('render');

        let fill = valById('fill');
        if (elById('use-gradient').checked) {
            fill = {
                type: valById('grad-type'),
                colors: [valById('grad-color1'), valById('grad-color2')],
                angle: intById('grad-angle')
            };
        }

        let finderColor = null;
        if (elById('use-finder-color').checked) {
            finderColor = valById('finder-color');
        }

        return {
            render: renderMode,
            crisp: valById('crisp') === 'true',
            ecLevel: valById('eclevel'),
            minVersion: intById('minversion'),
            fill,
            back: valById('back'),
            text: valById('text'),
            size: intById('size'),
            rounded: intById('rounded'),
            quiet: intById('quiet'),
            mode,
            mSize: intById('msize'),
            mPosX: intById('mposx'),
            mPosY: intById('mposy'),
            label: valById('label'),
            fontname: valById('font'),
            fontcolor: valById('fontcolor'),
            image: elById('img-buffer'),
            finderShape: valById('finder-shape') || null,
            finderEyeShape: valById('finder-eye-shape') || null,
            finderColor
        };
    }

    function updateQrcode() {
        const options = getQrcodeOptions();
        const container = elById('container');
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        try {
            const qrcodeEl = qrGen(options);
            if (qrcodeEl) {
                container.appendChild(qrcodeEl);
            }
        } catch (e) {
            console.error('Error generating QR code:', e);
        }
    }

    function update() {
        updateLabels();
        toggleFields();
        updateQrcode();
    }

    function handleImageUpload(ev) {
        const file = ev.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = evLoaded => {
                elById('img-buffer').setAttribute('src', evLoaded.target.result);
                setTimeout(update, 100);
            };
            reader.readAsDataURL(file);
        }
    }

    function downloadQrcode() {
        const container = elById('container');
        const el = container.firstChild;
        if (!el) {
            return;
        }

        let url = '';
        let filename = 'qrcode.png';

        if (el.tagName === 'CANVAS') {
            url = el.toDataURL('image/png');
        } else if (el.tagName === 'IMG') {
            url = el.getAttribute('src');
        } else if (el.tagName === 'svg' || el.nodeName === 'svg') {
            const svgString = new XMLSerializer().serializeToString(el);
            const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
            url = URL.createObjectURL(svgBlob);
            filename = 'qrcode.svg';
        }

        if (url) {
            const a = doc.createElement('a');
            a.href = url;
            a.download = filename;
            doc.body.appendChild(a);
            a.click();
            doc.body.removeChild(a);
        }
    }

    function copyToClipboard(text, onSuccess) {
        if (!navigator.clipboard) {
            const textArea = doc.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            doc.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                doc.execCommand('copy');
                if (onSuccess) {
                    onSuccess();
                }
            } catch (err) {
                console.error('Fallback copy failed', err);
            }
            doc.body.removeChild(textArea);
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            if (onSuccess) {
                onSuccess();
            }
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }

    function copySvgString() {
        const options = getQrcodeOptions('svg');
        try {
            const svgStr = qrGen.toSVGString(options);
            const btn = elById('btn-copy-svg');
            const originalText = btn.textContent;
            copyToClipboard(svgStr, () => {
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 1500);
            });
        } catch (e) {
            console.error('Error generating SVG string:', e);
        }
    }

    function copyDataUrl() {
        const options = getQrcodeOptions('canvas');
        try {
            const dataUrl = qrGen.toDataURL(options);
            const btn = elById('btn-copy-dataurl');
            const originalText = btn.textContent;
            copyToClipboard(dataUrl, () => {
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 1500);
            });
        } catch (e) {
            console.error('Error generating DataURL:', e);
        }
    }

    doc.addEventListener('DOMContentLoaded', () => {
        const inputs = doc.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', update);
            input.addEventListener('change', update);
        });

        const imageInput = elById('image');
        if (imageInput) {
            imageInput.addEventListener('change', handleImageUpload);
        }

        const downloadBtn = elById('btn-download');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', downloadQrcode);
        }

        const copySvgBtn = elById('btn-copy-svg');
        if (copySvgBtn) {
            copySvgBtn.addEventListener('click', copySvgString);
        }

        const copyDataUrlBtn = elById('btn-copy-dataurl');
        if (copyDataUrlBtn) {
            copyDataUrlBtn.addEventListener('click', copyDataUrl);
        }

        elById('img-buffer').addEventListener('load', update);

        update();
    });
}());
