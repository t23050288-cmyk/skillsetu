import QRCode from "qrcode";

export async function qrSvg(text: string) {
  return QRCode.toString(text, {
    type: "svg",
    margin: 1,
    width: 128,
    color: { dark: "#17140f", light: "#ffffff" },
  });
}

export function siteBase() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
