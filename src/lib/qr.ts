import QRCode from "qrcode";

export async function getQrSvg(url: string, size = 96): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    margin: 0,
    width: size,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  });
}
