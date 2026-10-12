import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import PptxGenJS from "pptxgenjs";
import type { PressCopy, SlidesCopy, SocialCopy } from "@/lib/studio-copy";
import { socialPlain } from "@/lib/studio-copy";

export type DocStill = {
  title: string;
  bytes: Buffer;
};

const INK = rgb(0.02, 0.02, 0.02);
const MUTE = rgb(0.28, 0.28, 0.28);

function wrap(text: string, widthOf: (line: string) => number, width: number) {
  const lines: string[] = [];
  for (const para of text.replace(/\r/g, "").split("\n")) {
    if (!para.trim()) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of para.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (widthOf(next) > width && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function pictureKind(bytes: Buffer): "png" | "jpg" | null {
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50) return "png";
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8) return "jpg";
  return null;
}

export async function stampPressPdf(opts: {
  copy: PressCopy;
  brand: string;
  stills: DocStill[];
}) {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pageSize: [number, number] = [595.28, 841.89];
  let page = doc.addPage(pageSize);
  const margin = 48;
  let y = page.getHeight() - margin;
  const maxW = page.getWidth() - margin * 2;

  const ensure = (need: number) => {
    if (y - need < margin) {
      page = doc.addPage(pageSize);
      y = page.getHeight() - margin;
    }
  };

  const write = (text: string, size: number, font = regular, color = INK, gap = 8) => {
    const lines = wrap(text, (line) => font.widthOfTextAtSize(line, size), maxW);
    for (const line of lines) {
      ensure(size + 6);
      if (line) page.drawText(line, { x: margin, y: y - size, size, font, color });
      y -= size + 4;
    }
    y -= gap;
  };

  write(opts.brand, 9, regular, MUTE, 6);
  write(opts.copy.headline || opts.copy.title, 22, bold, INK, 10);
  if (opts.copy.standfirst) write(opts.copy.standfirst, 12, regular, MUTE, 14);
  if (opts.copy.body) write(opts.copy.body, 11, regular, INK, 12);
  if (opts.copy.cta) write(opts.copy.cta, 12, bold, INK, 8);
  if (opts.copy.contact) write(opts.copy.contact, 10, regular, MUTE, 16);

  for (const still of opts.stills.slice(0, 4)) {
    const kind = pictureKind(still.bytes);
    if (!kind) continue;
    const image = kind === "png" ? await doc.embedPng(still.bytes) : await doc.embedJpg(still.bytes);
    const fit = image.scaleToFit(maxW, 220);
    ensure(fit.height + 28);
    page.drawImage(image, { x: margin, y: y - fit.height, width: fit.width, height: fit.height });
    y -= fit.height + 6;
    if (still.title) write(still.title, 8, regular, MUTE, 12);
  }

  return Buffer.from(await doc.save());
}

export async function stampSlidesPptx(opts: {
  copy: SlidesCopy;
  brand: string;
  stills: DocStill[];
}) {
  const pres = new PptxGenJS();
  pres.author = "Design Lab North";
  pres.title = opts.copy.title;
  pres.layout = "LAYOUT_WIDE";

  const cover = pres.addSlide();
  cover.addText(opts.brand, { x: 0.7, y: 1.8, w: 11, h: 0.4, fontSize: 12, color: "414141", fontFace: "Arial" });
  cover.addText(opts.copy.title, { x: 0.7, y: 2.3, w: 11, h: 1.4, fontSize: 32, color: "000000", fontFace: "Arial", bold: true });

  for (const slide of opts.copy.deck) {
    const node = pres.addSlide();
    node.addText(slide.title || " ", { x: 0.7, y: 0.45, w: 11, h: 0.7, fontSize: 22, color: "000000", fontFace: "Arial", bold: true });
    if (slide.lines.length) {
      node.addText(
        slide.lines.map((line) => ({ text: line, options: { bullet: true, breakLine: true } })),
        { x: 0.7, y: 1.3, w: 11, h: 5.2, fontSize: 16, color: "111111", fontFace: "Arial", valign: "top" },
      );
    }
  }

  for (const still of opts.stills.slice(0, 6)) {
    const kind = pictureKind(still.bytes);
    if (!kind) continue;
    const node = pres.addSlide();
    node.addText(still.title || "Still", { x: 0.7, y: 0.35, w: 11, h: 0.4, fontSize: 14, color: "414141", fontFace: "Arial" });
    node.addImage({
      data: `data:image/${kind === "png" ? "png" : "jpeg"};base64,${still.bytes.toString("base64")}`,
      x: 0.7,
      y: 0.9,
      w: 11.2,
      h: 5.8,
    });
  }

  const written = await pres.write({ outputType: "nodebuffer" });
  return Buffer.isBuffer(written) ? written : Buffer.from(written as ArrayBuffer);
}

export function stampSocialText(copy: SocialCopy) {
  return socialPlain(copy);
}
