import QRCode from 'qrcode';

export async function qrToPngBuffer(url, size = 512) {
  return QRCode.toBuffer(url, {
    type: 'png',
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
  });
}

export async function qrToSvgString(url) {
  return QRCode.toString(url, {
    type: 'svg',
    margin: 2,
    errorCorrectionLevel: 'M',
  });
}

export async function qrToDataUrl(url, size = 220) {
  return QRCode.toDataURL(url, {
    width: size,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
}
