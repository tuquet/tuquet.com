/**
 * Lightweight, zero-dependency, client-side A4 vector PDF generator for the CV page.
 * Reads directly from the rendered `.cv-page .prose` DOM so `pages/cv.md` stays the SSOT.
 */

interface TextRun {
  text: string
  bold?: boolean
  italic?: boolean
  muted?: boolean
}

const PAGE_W = 595.28 // A4 width in pt
const PAGE_H = 841.89 // A4 height in pt
const MARGIN_X = 38
const MARGIN_TOP = 36
const MARGIN_BOTTOM = 36
const CONTENT_W = PAGE_W - MARGIN_X * 2

const WINANSI_MAP: Record<string, number> = {
  '\u20AC': 0x80,
  '\u201A': 0x82,
  '\u0192': 0x83,
  '\u201E': 0x84,
  '\u2026': 0x85,
  '\u2020': 0x86,
  '\u2021': 0x87,
  '\u02C6': 0x88,
  '\u2030': 0x89,
  '\u0160': 0x8A,
  '\u2039': 0x8B,
  '\u0152': 0x8C,
  '\u017D': 0x8E,
  '\u2018': 0x91,
  '\u2019': 0x92,
  '\u201C': 0x93,
  '\u201D': 0x94,
  '\u2022': 0x95,
  '\u2013': 0x96,
  '\u2014': 0x97,
  '\u02DC': 0x98,
  '\u2122': 0x99,
  '\u0161': 0x9A,
  '\u203A': 0x9B,
  '\u0153': 0x9C,
  '\u017E': 0x9E,
  '\u0178': 0x9F,
}

function normalizeForPdf(input: string): string {
  return input
    .replace(/\u2194/g, '<->')
    .replace(/\u2192/g, '->')
    .replace(/\u2190/g, '<-')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
}

function encodeWinAnsiHex(text: string): string {
  const clean = normalizeForPdf(text)
  let hex = ''
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i)
    const ch = clean[i]
    if (code >= 0x20 && code <= 0xFF)
      hex += code.toString(16).padStart(2, '0')
    else if (WINANSI_MAP[ch] !== undefined)
      hex += WINANSI_MAP[ch].toString(16).padStart(2, '0')
    else
      hex += '20'
  }
  return `<${hex}>`
}

// Helvetica AFM width estimator (1/1000 em) for accurate line wrapping & right-alignment
const HELV_WIDTHS: Record<string, number> = {
  ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, '\'': 191,
  '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556, '@': 1015,
  '[': 278, '\\': 278, ']': 278, '^': 469, '_': 556, '`': 333, '{': 334, '|': 260, '}': 334, '~': 584,
  'A': 667, 'B': 667, 'C': 722, 'D': 722, 'E': 667, 'F': 611, 'G': 778, 'H': 722, 'I': 278,
  'J': 500, 'K': 667, 'L': 556, 'M': 833, 'N': 722, 'O': 778, 'P': 667, 'Q': 778, 'R': 722,
  'S': 667, 'T': 611, 'U': 722, 'V': 667, 'W': 944, 'X': 667, 'Y': 667, 'Z': 611,
  'a': 556, 'b': 556, 'c': 500, 'd': 556, 'e': 556, 'f': 278, 'g': 556, 'h': 556, 'i': 222,
  'j': 222, 'k': 500, 'l': 222, 'm': 833, 'n': 556, 'o': 556, 'p': 556, 'q': 556, 'r': 333,
  's': 500, 't': 278, 'u': 556, 'v': 500, 'w': 722, 'x': 500, 'y': 500, 'z': 500,
  '\u2013': 556, '\u2014': 1000, '\u2022': 350, '\u00B7': 278,
}

function estimateTextWidth(text: string, fontSize: number, bold = false): number {
  let units = 0
  const clean = normalizeForPdf(text)
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]
    if (HELV_WIDTHS[ch] !== undefined)
      units += HELV_WIDTHS[ch]
    else if (ch >= '0' && ch <= '9')
      units += 556
    else
      units += 556
  }
  return (units / 1000) * fontSize * (bold ? 1.05 : 1)
}

function wrapRuns(runs: TextRun[], maxWidth: number, fontSize: number): TextRun[][] {
  const tokens: TextRun[] = []
  for (const run of runs) {
    const parts = normalizeForPdf(run.text).split(/(\s+)/)
    for (const part of parts) {
      if (!part)
        continue
      tokens.push({ ...run, text: part })
    }
  }

  const lines: TextRun[][] = []
  let currentLine: TextRun[] = []
  let lineWidth = 0

  for (const token of tokens) {
    const isSpace = /^\s+$/.test(token.text)
    if (isSpace && currentLine.length === 0)
      continue

    const tokW = estimateTextWidth(token.text, fontSize, token.bold)
    if (lineWidth + tokW > maxWidth && currentLine.length > 0 && !isSpace) {
      while (currentLine.length > 0 && /^\s+$/.test(currentLine[currentLine.length - 1].text))
        currentLine.pop()
      lines.push(currentLine)
      currentLine = []
      lineWidth = 0
    }

    const last = currentLine[currentLine.length - 1]
    if (last && !!last.bold === !!token.bold && !!last.italic === !!token.italic && !!last.muted === !!token.muted)
      last.text += token.text
    else
      currentLine.push({ ...token })

    lineWidth += tokW
  }

  if (currentLine.length > 0) {
    while (currentLine.length > 0 && /^\s+$/.test(currentLine[currentLine.length - 1].text))
      currentLine.pop()
    if (currentLine.length > 0)
      lines.push(currentLine)
  }

  return lines.length ? lines : [[{ text: '' }]]
}

function extractRuns(node: Node, state: { bold?: boolean, italic?: boolean, muted?: boolean } = {}): TextRun[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const txt = node.textContent || ''
    return txt ? [{ text: txt, ...state }] : []
  }
  if (node.nodeType !== Node.ELEMENT_NODE)
    return []

  const el = node as HTMLElement
  if (el.classList.contains('header-anchor') || el.classList.contains('print:hidden'))
    return []

  const tag = el.tagName.toLowerCase()
  const nextState = {
    bold: state.bold || tag === 'strong' || tag === 'b',
    italic: state.italic || tag === 'em' || tag === 'i',
    muted: state.muted,
  }

  const runs: TextRun[] = []
  for (const child of Array.from(el.childNodes))
    runs.push(...extractRuns(child, nextState))
  return runs
}

function pickPdfFont(run: TextRun): string {
  if (run.bold && run.italic)
    return '/F4'
  if (run.bold)
    return '/F2'
  if (run.italic)
    return '/F3'
  return '/F1'
}

class PdfDocBuilder {
  private pages: string[][] = [[]]
  public y = PAGE_H - MARGIN_TOP

  private currentStream(): string[] {
    return this.pages[this.pages.length - 1]
  }

  ensureSpace(neededHeight: number) {
    if (this.y - neededHeight < MARGIN_BOTTOM) {
      this.pages.push([])
      this.y = PAGE_H - MARGIN_TOP
    }
  }

  moveDown(pts: number) {
    this.y -= pts
  }

  drawRule(colorRgb = '0.84 0.84 0.86', width = 0.6, x1 = MARGIN_X, x2 = PAGE_W - MARGIN_X) {
    this.currentStream().push(`q ${colorRgb} RG ${width} w ${x1.toFixed(2)} ${this.y.toFixed(2)} m ${x2.toFixed(2)} ${this.y.toFixed(2)} l S Q`)
  }

  drawRunsLine(runs: TextRun[], x: number, y: number, fontSize: number, defaultColor = '0.10 0.10 0.11') {
    const ops: string[] = ['BT', `1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`]
    let prevFont = ''
    let prevColor = ''
    let hasText = false

    for (const run of runs) {
      const clean = normalizeForPdf(run.text)
      if (!clean)
        continue
      hasText = true
      const font = pickPdfFont(run)
      const color = run.muted ? '0.35 0.35 0.39' : defaultColor
      if (color !== prevColor) {
        ops.push(`${color} rg`)
        prevColor = color
      }
      if (font !== prevFont) {
        ops.push(`${font} ${fontSize.toFixed(1)} Tf`)
        prevFont = font
      }
      ops.push(`${encodeWinAnsiHex(clean)} Tj`)
    }

    if (hasText) {
      ops.push('ET')
      this.currentStream().push(ops.join(' '))
    }
  }

  drawWrappedParagraph(runs: TextRun[], opts: { x?: number, width?: number, fontSize?: number, lineHeight?: number, spaceAfter?: number, color?: string } = {}) {
    const x = opts.x ?? MARGIN_X
    const width = opts.width ?? CONTENT_W
    const fontSize = opts.fontSize ?? 9.0
    const lineHeight = opts.lineHeight ?? fontSize * 1.36
    const lines = wrapRuns(runs, width, fontSize)

    for (const line of lines) {
      this.ensureSpace(lineHeight)
      this.y -= fontSize
      this.drawRunsLine(line, x, this.y, fontSize, opts.color)
      this.y -= (lineHeight - fontSize)
    }
    if (opts.spaceAfter)
      this.moveDown(opts.spaceAfter)
  }

  drawBullet(runs: TextRun[], indent = 0) {
    const fontSize = 8.7
    const lineHeight = 11.8
    const bulletX = MARGIN_X + indent
    const textX = bulletX + 10
    const lines = wrapRuns(runs, CONTENT_W - indent - 10, fontSize)

    this.ensureSpace(lineHeight)
    for (let i = 0; i < lines.length; i++) {
      this.ensureSpace(lineHeight)
      this.y -= fontSize
      if (i === 0)
        this.drawRunsLine([{ text: '\u2022', bold: true }], bulletX, this.y, fontSize, '0.25 0.25 0.28')
      this.drawRunsLine(lines[i], textX, this.y, fontSize, '0.12 0.12 0.14')
      this.y -= (lineHeight - fontSize)
    }
    this.moveDown(1.0)
  }

  drawTable(tableEl: HTMLTableElement) {
    const headerCells = Array.from(tableEl.querySelectorAll('thead th')).map(th => (th.textContent || '').trim())
    const bodyRows = Array.from(tableEl.querySelectorAll('tbody tr')).map(tr =>
      Array.from(tr.querySelectorAll('td')).map(td => extractRuns(td)),
    )
    if (!headerCells.length)
      return

    const colCount = headerCells.length
    let colRatios: number[]
    if (colCount === 2)
      colRatios = [0.27, 0.73]
    else if (colCount === 3)
      colRatios = [0.14, 0.28, 0.58]
    else if (colCount === 5)
      colRatios = [0.09, 0.09, 0.24, 0.21, 0.37]
    else
      colRatios = Array.from({ length: colCount }, () => 1 / colCount)

    const colWidths = colRatios.map(r => r * CONTENT_W)
    const fontSize = 8.2
    const lineHeight = 11.0
    const padY = 3.5

    const drawHeader = () => {
      this.ensureSpace(lineHeight + padY * 2 + 4)
      let x = MARGIN_X
      this.y -= fontSize
      for (let c = 0; c < colCount; c++) {
        this.drawRunsLine([{ text: headerCells[c], bold: true }], x + (c === 0 ? 0 : 4), this.y, fontSize, '0.05 0.05 0.06')
        x += colWidths[c]
      }
      this.y -= 4
      this.drawRule('0.65 0.65 0.70', 0.7)
      this.y -= 3
    }

    drawHeader()

    for (const row of bodyRows) {
      const cellLines = row.map((runs, c) => wrapRuns(runs, colWidths[c] - (c === 0 ? 4 : 8), fontSize))
      const maxLines = Math.max(1, ...cellLines.map(l => l.length))
      const rowHeight = maxLines * lineHeight + padY

      if (this.y - rowHeight < MARGIN_BOTTOM) {
        this.pages.push([])
        this.y = PAGE_H - MARGIN_TOP
        drawHeader()
      }

      const startY = this.y
      let x = MARGIN_X
      for (let c = 0; c < colCount; c++) {
        let cellY = startY
        for (const line of cellLines[c]) {
          cellY -= fontSize
          this.drawRunsLine(line, x + (c === 0 ? 0 : 4), cellY, fontSize, '0.12 0.12 0.14')
          cellY -= (lineHeight - fontSize)
        }
        x += colWidths[c]
      }
      this.y = startY - maxLines * lineHeight - 1.5
      this.drawRule('0.88 0.88 0.90', 0.45)
      this.y -= 2.5
    }
    this.moveDown(4)
  }

  buildBlob(): Blob {
    const totalPages = this.pages.length
    for (let p = 0; p < totalPages; p++) {
      const footerY = 18
      const footerText = `Nguyen Dinh Tu (Tu Quet)  |  tuquet.com/cv  |  Page ${p + 1} / ${totalPages}`
      const textW = estimateTextWidth(footerText, 7.5)
      const x = (PAGE_W - textW) / 2
      this.pages[p].push(`BT 0.48 0.48 0.52 rg /F1 7.5 Tf 1 0 0 1 ${x.toFixed(2)} ${footerY.toFixed(2)} Tm ${encodeWinAnsiHex(footerText)} Tj ET`)
    }

    const objects: string[] = []
    const addObj = (body: string) => {
      objects.push(body)
      return objects.length
    }

    const catalogId = addObj('') // 1
    const pagesId = addObj('') // 2
    const f1Id = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
    const f2Id = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')
    const f3Id = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>')
    const f4Id = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-BoldOblique /Encoding /WinAnsiEncoding >>')

    const pageIds: number[] = []
    for (const streamLines of this.pages) {
      const streamContent = `${streamLines.join('\n')}\n`
      const contentId = addObj(`<< /Length ${streamContent.length} >>\nstream\n${streamContent}endstream`)
      const pageId = addObj(
        `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_W.toFixed(2)} ${PAGE_H.toFixed(2)}] /Resources << /Font << /F1 ${f1Id} 0 R /F2 ${f2Id} 0 R /F3 ${f3Id} 0 R /F4 ${f4Id} 0 R >> >> /Contents ${contentId} 0 R >>`,
      )
      pageIds.push(pageId)
    }

    objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`
    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`

    let pdf = '%PDF-1.4\n'
    const offsets: number[] = [0]
    for (let i = 0; i < objects.length; i++) {
      offsets.push(pdf.length)
      pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`
    }

    const xrefStart = pdf.length
    pdf += `xref\n0 ${objects.length + 1}\n`
    pdf += '0000000000 65535 f \n'
    for (let i = 1; i <= objects.length; i++)
      pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`

    const bytes = new Uint8Array(pdf.length)
    for (let i = 0; i < pdf.length; i++)
      bytes[i] = pdf.charCodeAt(i) & 0xFF
    return new Blob([bytes], { type: 'application/pdf' })
  }
}

export function generateAndDownloadCvPdf(filename = 'Nguyen_Dinh_Tu_CV.pdf') {
  if (typeof window === 'undefined' || typeof document === 'undefined')
    return

  const prose = document.querySelector('article.cv-page .prose')
  if (!prose)
    return

  const doc = new PdfDocBuilder()

  const headerTop = prose.querySelector('.cv-header-top')
  const name = headerTop?.querySelector('strong')?.textContent?.trim() || 'Nguyen Dinh Tu'
  const nickname = headerTop?.querySelector('.profile-nickname')?.textContent?.trim() || '(Tu Quet)'
  const role = headerTop?.querySelector('.cv-role-badge')?.textContent?.trim() || 'Software Engineer & Architect'

  const nameRuns: TextRun[] = [
    { text: `${name} `, bold: true },
    { text: nickname, muted: true },
  ]
  doc.ensureSpace(22)
  doc.moveDown(16)
  const nameY = doc.y
  doc.drawRunsLine(nameRuns, MARGIN_X, nameY, 16, '0.04 0.04 0.05')
  const roleW = estimateTextWidth(role, 9.2, false)
  doc.drawRunsLine([{ text: role, muted: true }], PAGE_W - MARGIN_X - roleW, nameY + 1, 9.2)
  doc.moveDown(7)
  doc.drawRule('0.78 0.78 0.82', 0.8)
  doc.moveDown(6)

  const contactItems = Array.from(prose.querySelectorAll('.cv-contact-grid > div')).map(el =>
    normalizeForPdf(el.textContent || '').trim(),
  ).filter(Boolean)

  if (contactItems.length) {
    const contactRuns: TextRun[] = contactItems.flatMap((item, idx) => {
      const colonIdx = item.indexOf(':')
      const prefix = idx > 0 ? [{ text: '  |  ', muted: true }] : []
      if (colonIdx > 0) {
        return [
          ...prefix,
          { text: `${item.slice(0, colonIdx + 1)} `, bold: true },
          { text: item.slice(colonIdx + 1).trim(), muted: true },
        ]
      }
      return [...prefix, { text: item, muted: true }]
    })
    doc.drawWrappedParagraph(contactRuns, { fontSize: 8.1, lineHeight: 11.2, spaceAfter: 6 })
  }

  for (const child of Array.from(prose.children)) {
    const el = child as HTMLElement
    if (el.classList.contains('cv-header'))
      continue

    const tag = el.tagName.toLowerCase()
    if (tag === 'p') {
      const runs = extractRuns(el)
      if (runs.length)
        doc.drawWrappedParagraph(runs, { fontSize: 8.8, lineHeight: 12.2, spaceAfter: 5, color: '0.16 0.16 0.18' })
    }
    else if (tag === 'h2') {
      const title = normalizeForPdf(el.textContent || '').replace(/#\s*$/, '').trim()
      doc.ensureSpace(42)
      doc.moveDown(5)
      doc.drawWrappedParagraph([{ text: title, bold: true }], { fontSize: 10.2, lineHeight: 13, spaceAfter: 1, color: '0.04 0.04 0.05' })
      doc.drawRule('0.76 0.76 0.80', 0.7)
      doc.moveDown(6)
    }
    else if (tag === 'h3') {
      const title = normalizeForPdf(el.textContent || '').replace(/#\s*$/, '').trim()
      doc.ensureSpace(32)
      doc.moveDown(3)
      doc.drawWrappedParagraph([{ text: title, bold: true }], { fontSize: 9.3, lineHeight: 12.5, spaceAfter: 2.5, color: '0.06 0.06 0.08' })
    }
    else if (tag === 'table') {
      doc.drawTable(el as HTMLTableElement)
    }
    else if (tag === 'ul') {
      for (const li of Array.from(el.children)) {
        const liEl = li as HTMLElement
        const nestedUl = liEl.querySelector(':scope > ul')
        const directRuns: TextRun[] = []
        for (const n of Array.from(liEl.childNodes)) {
          if (n.nodeType === Node.ELEMENT_NODE && (n as HTMLElement).tagName.toLowerCase() === 'ul')
            continue
          directRuns.push(...extractRuns(n))
        }
        if (directRuns.length)
          doc.drawBullet(directRuns, 0)
        if (nestedUl) {
          for (const subLi of Array.from(nestedUl.children)) {
            const subRuns = extractRuns(subLi)
            if (subRuns.length)
              doc.drawBullet(subRuns, 12)
          }
        }
      }
      doc.moveDown(2)
    }
  }

  const blob = doc.buildBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
