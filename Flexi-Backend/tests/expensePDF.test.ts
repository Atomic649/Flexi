/**
 * PDF Bank Statement Parser Tests
 *
 * Parses each real PDF in uploads/statement/ and asserts on detected bank,
 * transaction counts, field values, and sName extraction.
 *
 * Parsing logic here mirrors expensePDFController.ts — keep both in sync.
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ParsedTransaction {
  dateTime: string;
  code: string;
  amount: number;
  desc: string;
  note: string;
}

interface TransactionWithSName extends ParsedTransaction {
  sName: string | null;
}

// ── Bank detection ────────────────────────────────────────────────────────────

function detectBank(text: string): string {
  return text.includes('กรุงศรีอยุธยา') ? 'KRUNGSRI'
    : (text.includes('KBPDF') || text.includes('K PLUS')) ? 'KBANK'
    : text.includes('ttbbank.com') ? 'TTB'
    : 'SCB';
}

// ── KBank parser ──────────────────────────────────────────────────────────────

function parseKBank(lines: string[]): ParsedTransaction[] {
  const kbankTypeAmountRegex =
    /(ช(?:\u0E33|\u0E4D\u0E32)ระเงิน|โอนเงิน|หักบัญชี|รับโอนเงิน|รายการแก้ไข|Payment|Transfer Withdrawal|Transfer Deposit)(\d{1,3}(?:,\d{3})*\.\d{2})$/;
  const isKBankExpense = (type: string): boolean =>
    /^(?:ช(?:\u0E33|\u0E4D\u0E32)ระเงิน|โอนเงิน|หักบัญชี|Payment|Transfer Withdrawal)$/.test(type);

  const result: ParsedTransaction[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateTimeMatch = line.match(/^(\d{2})-(\d{2})-(\d{2})(\d{2}:\d{2})/);
    if (!dateTimeMatch) continue;
    const [, day, month, year, time] = dateTimeMatch;
    const dateTime = `20${year}-${month}-${day}T${time}:00.000Z`;

    let fullContent = line;
    let typeAmountMatch = fullContent.match(kbankTypeAmountRegex);
    if (!typeAmountMatch) {
      for (let j = i + 1; j <= i + 5 && j < lines.length; j++) {
        const nextLine = lines[j];
        if (/^\d{2}-\d{2}-\d{2}\d{2}:\d{2}/.test(nextLine)) break;
        fullContent += ' ' + nextLine;
        typeAmountMatch = fullContent.match(kbankTypeAmountRegex);
        if (typeAmountMatch) break;
      }
    }
    if (!typeAmountMatch) continue;
    const transType = typeAmountMatch[1];
    if (!isKBankExpense(transType)) continue;
    const amount = parseFloat(typeAmountMatch[2].replace(/,/g, ''));

    let desc = fullContent
      .replace(/^\d{2}-\d{2}-\d{2}\d{2}:\d{2}/, '')
      .replace(kbankTypeAmountRegex, '')
      .trim();
    desc = desc.replace(/^[^\d]*([\d,]+\.\d{2})/, '').trim();

    result.push({ dateTime, code: `KBANK/${transType}`, amount, desc, note: '' });
  }
  return result;
}

// ── Krungsri parser ───────────────────────────────────────────────────────────

function parseKrungsri(lines: string[]): ParsedTransaction[] {
  const isKrungsriExpense = (type: string): boolean =>
    /^(?:โอนเงินพร้อมเพย์|โอนเงิน|ช(?:\u0E33|\u0E4D\u0E32)ระด้วยบัตร|จ่ายบิล|จ่ายคิวอาร์|ถอนเงินสด)/.test(type);
  const isKrungsriIncome = (type: string): boolean =>
    /^(?:รับโอนเงิน|ฝากด้วยเช็ค)/.test(type);

  const result: ParsedTransaction[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateTimeMatch = line.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}:\d{2}):\d{2}/);
    if (!dateTimeMatch) continue;
    const [, day, month, year, time] = dateTimeMatch;
    const dateTime = `${year}-${month}-${day}T${time}:00.000Z`;
    const afterTs = line.replace(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/, '');
    const typeAmountRest = afterTs.match(/^([^\d]+?)(\d{1,3}(?:,\d{3})*\.\d{2})(.*)/);
    if (!typeAmountRest) continue;
    const transType = typeAmountRest[1].trim();
    const amount = parseFloat(typeAmountRest[2].replace(/,/g, ''));
    const restAfterAmount = typeAmountRest[3];
    if (isKrungsriIncome(transType)) continue;
    if (!isKrungsriExpense(transType)) continue;
    const desc = restAfterAmount
      .replace(/^\d{1,3}(?:,\d{3})*\.\d{2}/, '')
      .replace(/^(?:MOBILE|POS|ATM|INTERNET|BRANCH|ALS)/, '')
      .trim();
    result.push({ dateTime, code: `KRUNGSRI/${transType}`, amount, desc, note: '' });
  }
  return result;
}

// ── TTB parser ────────────────────────────────────────────────────────────────

function parseTTB(lines: string[]): ParsedTransaction[] {
  const ttbThaiMonthMap: Record<string, string> = {
    'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03',
    'เม.ย.': '04', 'พ.ค.': '05', 'มิ.ย.': '06',
    'ก.ค.': '07', 'ส.ค.': '08', 'ก.ย.': '09',
    'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12',
  };
  const isTTBExpense = (type: string): boolean =>
    /^(?:โอนเงินออก|ถอนเงิน|ช(?:\u0E33|\u0E4D\u0E32)ระบิล|จ่ายบิล)/.test(type);

  const result: ParsedTransaction[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateTimeMatch = line.match(/^(\d{1,2})\s+([\u0E00-\u0E7F.]+)\s+(\d{2})(\d{2}:\d{2})/);
    if (!dateTimeMatch) continue;
    const [, day, thaiMonth, shortYear, time] = dateTimeMatch;
    const month = ttbThaiMonthMap[thaiMonth];
    if (!month) continue;
    const ceYear = parseInt(shortYear, 10) + 1957; // BE short 69 → CE 2026 (2500+69-543)
    const dateTime = `${ceYear}-${month}-${day.padStart(2, '0')}T${time}:00.000Z`;

    const afterTs = line.replace(/^\d{1,2}\s+[\u0E00-\u0E7F.]+\s+\d{2}\d{2}:\d{2}/, '');
    const signedAmountIdx = afterTs.search(/[+-]\d/);
    if (signedAmountIdx === -1) continue;
    const signedAmountMatch = afterTs.slice(signedAmountIdx).match(/^([+-]\d{1,3}(?:,\d{3})*\.\d{2})(.*)/);
    if (!signedAmountMatch) continue;
    const signedAmount = signedAmountMatch[1];
    const afterAmount = signedAmountMatch[2];
    if (signedAmount.startsWith('+')) continue;
    const amount = Math.abs(parseFloat(signedAmount.replace(/,/g, '')));

    const beforeAmount = afterTs.slice(0, signedAmountIdx);
    const typeMatch = beforeAmount.match(/^([\u0E00-\u0E7F]+)/);
    const transType = typeMatch ? typeMatch[1] : beforeAmount.trim();
    if (!isTTBExpense(transType)) continue;

    let desc = afterAmount.replace(/^\d{1,3}(?:,\d{3})*\.\d{2}/, '').trim();
    if (desc === '-') desc = '';

    result.push({ dateTime, code: `TTB/${transType}`, amount, desc, note: '' });
  }
  return result;
}

// ── SCB parser ────────────────────────────────────────────────────────────────

function parseSCB(lines: string[]): ParsedTransaction[] {
  const allTransactions: ParsedTransaction[] = [];
  const newFormatLineRegex =
    /^(\d{2}\/\d{2}\/\d{2})(\d{2}:\d{2})(X[12])(ENET|TELL|ATS)(\d{1,3}(?:,\d{3})*\.\d{2})(\d{1,3}(?:,\d{3})*\.\d{2})$/;
  const oldFormatDateRegex = /^\d{2}\/\d{2}\/\d{2}$/;
  const oldFormatTransRegex =
    /^(X[12])\/(ENET|TELL|ATS)(\d{1,3}(?:,\d{3})*\.\d{2})(\d{1,3}(?:,\d{3})*\.\d{2})$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const newMatch = line.match(newFormatLineRegex);
    if (newMatch) {
      const [, date, time, codeType, channel, amount] = newMatch;
      const [day, month, year] = date.split('/');
      const dateTime = `20${year}-${month}-${day}T${time}:00.000Z`;
      const code = `${codeType}/${channel}`;
      const amountNum = parseFloat(amount.replace(/,/g, ''));
      let desc = '';
      let note = '';
      if (i + 1 < lines.length && lines[i + 1] === 'DESC :') {
        if (i + 2 < lines.length && lines[i + 2] !== 'NOTE :') desc = lines[i + 2];
        if (i + 3 < lines.length && lines[i + 3] === 'NOTE :' && i + 4 < lines.length) {
          const potentialNote = lines[i + 4];
          if (potentialNote !== '-') note = potentialNote;
        }
      }
      allTransactions.push({ dateTime, code, amount: amountNum, desc, note });
      continue;
    }
    const oldDateMatch = line.match(oldFormatDateRegex);
    if (oldDateMatch && i + 2 < lines.length) {
      const timeLine = lines[i + 1];
      const transactionLine = lines[i + 2];
      const timeMatch = timeLine.match(/^\d{2}:\d{2}$/);
      const transMatch = transactionLine.match(oldFormatTransRegex);
      if (timeMatch && transMatch) {
        const [, codeType, channel, amount] = transMatch;
        const [day, month, year] = line.split('/');
        const dateTime = `20${year}-${month}-${day}T${timeLine}:00.000Z`;
        const code = `${codeType}/${channel}`;
        const amountNum = parseFloat(amount.replace(/,/g, ''));
        let desc = '';
        let note = '';
        if (i + 3 < lines.length) {
          const descLine = lines[i + 3];
          if (descLine !== '-' && !descLine.startsWith('DESC :') && !descLine.startsWith('NOTE :')) {
            desc = descLine;
            if (i + 4 < lines.length) {
              const noteLine = lines[i + 4];
              if (noteLine !== '-' && !noteLine.startsWith('DESC :') && !noteLine.startsWith('NOTE :')) {
                note = noteLine;
              }
            }
          }
        }
        allTransactions.push({ dateTime, code, amount: amountNum, desc, note });
      }
    }
  }
  return allTransactions.filter(t => t.code.startsWith('X2'));
}

// ── sName extraction ──────────────────────────────────────────────────────────

function extractSName(item: ParsedTransaction): string | null {
  if (item.code.startsWith('TTB/')) {
    if (!item.desc) return null;
    return item.desc.replace(/^[A-Z]{2,6}\s+[Xx]\d{4}\s*/, '').trim() || null;
  }
  if (item.code.startsWith('KRUNGSRI/')) {
    if (!item.desc || /^จาก Card No\./i.test(item.desc) || /^ถอนเงินสดผ่าน/.test(item.desc)) return null;
    return item.desc.replace(/^[A-Z]{2,5}\s+/, '').trim() || null;
  }
  if (!item.desc) return null;
  const kwRegex = /(?:โอน(?:เงิน)?|โอนไป|จ่ายบิล|PromptPay|เพื่อช(?:\u0E33|\u0E4D\u0E32)ระ|\bTo\b|Paid for)/;
  if (!kwRegex.test(item.desc)) return null;
  const match = item.desc.match(
    /(?:โอน(?:เงิน)?|โอนไป|จ่ายบิล|PromptPay|เพื่อช(?:\u0E33|\u0E4D\u0E32)ระ|\bTo\b|Paid for)\s+(.*)/
  );
  if (!match) return null;
  const name = match[1].trim()
    .replace(/^.*?[xX]\d{4}\s*/, '')
    .replace(/\s*Ref\s+[xX]\d{4}.*/i, '')
    .trim();
  return name || null;
}

// ── Main parse helper ─────────────────────────────────────────────────────────

async function parsePDF(filePath: string): Promise<{
  bankType: string;
  transactions: TransactionWithSName[];
}> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  const text = data.text.normalize('NFC');
  const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);

  const bankType = detectBank(text);
  let codeAmount: ParsedTransaction[];
  if (bankType === 'KBANK')    codeAmount = parseKBank(lines);
  else if (bankType === 'TTB') codeAmount = parseTTB(lines);
  else if (bankType === 'KRUNGSRI') codeAmount = parseKrungsri(lines);
  else                         codeAmount = parseSCB(lines);

  return {
    bankType,
    transactions: codeAmount.map(item => ({ ...item, sName: extractSName(item) })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────

const PDF_DIR = path.join(__dirname, '..', 'uploads', 'statement');

// ── Bank Detection ────────────────────────────────────────────────────────────

describe('Bank Detection', () => {
  test.each([
    ['Kbank.pdf',  'KBANK'],
    ['TTB.pdf',    'TTB'],
    ['SCB.pdf',    'SCB'],
  ])('%s → %s', async (file, expectedBank) => {
    const buffer = fs.readFileSync(path.join(PDF_DIR, file));
    const { text } = await pdfParse(buffer);
    expect(detectBank(text.normalize('NFC'))).toBe(expectedBank);
  });

  test('Krusri.pdf falls back to SCB (garbled custom-font encoding — กรุงศรีอยุธยา not extractable)', async () => {
    const buffer = fs.readFileSync(path.join(PDF_DIR, 'Krusri.pdf'));
    const { text } = await pdfParse(buffer);
    expect(detectBank(text.normalize('NFC'))).toBe('SCB');
  });
});

// ── KBank ─────────────────────────────────────────────────────────────────────

describe('KBank — Kbank.pdf', () => {
  let result: Awaited<ReturnType<typeof parsePDF>>;
  beforeAll(async () => { result = await parsePDF(path.join(PDF_DIR, 'Kbank.pdf')); });

  test('detects KBANK', () => {
    expect(result.bankType).toBe('KBANK');
  });

  test('extracts exactly 13 expense transactions (statement header: "รวมถอนเงิน 13 รายการ")', () => {
    expect(result.transactions).toHaveLength(13);
  });

  test('all codes are prefixed KBANK/', () => {
    result.transactions.forEach(t => expect(t.code).toMatch(/^KBANK\//));
  });

  test('all amounts are positive', () => {
    result.transactions.forEach(t => expect(t.amount).toBeGreaterThan(0));
  });

  test('first transaction — โอนเงิน 95.00 at 2026-02-23 13:29', () => {
    const t = result.transactions[0];
    expect(t.dateTime).toBe('2026-02-23T13:29:00.000Z');
    expect(t.code).toBe('KBANK/โอนเงิน');
    expect(t.amount).toBe(95);
  });

  test('ชำระเงิน 100.00 at 13:33 — sName is TrueMoney Wallet', () => {
    const t = result.transactions.find(t => t.dateTime.includes('13:33'));
    expect(t).toBeDefined();
    expect(t!.code).toMatch(/^KBANK\/ช/); // ชำระเงิน (either sara am encoding)
    expect(t!.amount).toBe(100);
    expect(t!.sName).toBe('TrueMoney Wallet');
  });

  test('multi-line shop name at 10:43 — sName contains SCB มณี SHOP', () => {
    const t = result.transactions.find(t => t.dateTime.includes('10:43'));
    expect(t).toBeDefined();
    expect(t!.amount).toBe(100);
    expect(t!.sName).toContain('SCB มณี SHOP');
  });

  test('โอนเงิน sName strips account reference (xNNNN)', () => {
    // first transaction: "โอนไป X6567 น.ส. จุฑารัตน์..." → sName should not contain X6567
    const t = result.transactions[0];
    expect(t.sName).toBeTruthy();
    expect(t.sName).not.toMatch(/[xX]\d{4}/);
  });
});

// ── SCB ───────────────────────────────────────────────────────────────────────

describe('SCB — SCB.pdf', () => {
  let result: Awaited<ReturnType<typeof parsePDF>>;
  beforeAll(async () => { result = await parsePDF(path.join(PDF_DIR, 'SCB.pdf')); });

  test('detects SCB', () => {
    expect(result.bankType).toBe('SCB');
  });

  test('all transactions are debit (X2/...)', () => {
    result.transactions.forEach(t => expect(t.code).toMatch(/^X2\//));
  });

  test('extracts more than 10 expense transactions', () => {
    expect(result.transactions.length).toBeGreaterThan(10);
  });

  test('first transaction — X2/ENET 115.00 at 2026-02-01 20:05', () => {
    const t = result.transactions[0];
    expect(t.dateTime).toBe('2026-02-01T20:05:00.000Z');
    expect(t.code).toBe('X2/ENET');
    expect(t.amount).toBe(115);
  });

  test('desc populated from DESC : label', () => {
    expect(result.transactions[0].desc).toBe('จ่ายบิล ถุงเงิน (คลังยาสามวา)');
  });

  test('sName from จ่ายบิล desc strips keyword prefix', () => {
    expect(result.transactions[0].sName).toBe('ถุงเงิน (คลังยาสามวา)');
  });

  test('sName from PromptPay desc strips xNNNN reference', () => {
    const t = result.transactions.find(t => t.desc?.startsWith('PromptPay'));
    expect(t).toBeDefined();
    expect(t!.sName).toBeTruthy();
    expect(t!.sName).not.toContain('PromptPay');
    expect(t!.sName).not.toMatch(/[xX]\d{4}/i);
  });

  test('X2/TELL channel is also captured', () => {
    const t = result.transactions.find(t => t.code === 'X2/TELL');
    expect(t).toBeDefined();
    expect(t!.amount).toBeGreaterThan(0);
  });

  test('all amounts are positive', () => {
    result.transactions.forEach(t => expect(t.amount).toBeGreaterThan(0));
  });
});

// ── TTB ───────────────────────────────────────────────────────────────────────

describe('TTB — TTB.pdf', () => {
  let result: Awaited<ReturnType<typeof parsePDF>>;
  beforeAll(async () => { result = await parsePDF(path.join(PDF_DIR, 'TTB.pdf')); });

  test('detects TTB', () => {
    expect(result.bankType).toBe('TTB');
  });

  test('extracts exactly 2 expense transactions (statement header: "2 รายการรวมถอนเงิน")', () => {
    expect(result.transactions).toHaveLength(2);
  });

  test('all codes are prefixed TTB/', () => {
    result.transactions.forEach(t => expect(t.code).toMatch(/^TTB\//));
  });

  test('Buddhist Era short year 69 → CE 2026', () => {
    result.transactions.forEach(t => expect(t.dateTime).toMatch(/^2026-/));
  });

  test('first transaction — โอนเงินออก 1700.00 at 2026-01-30 13:16', () => {
    const t = result.transactions[0];
    expect(t.code).toBe('TTB/โอนเงินออก');
    expect(t.amount).toBe(1700);
    expect(t.dateTime).toBe('2026-01-30T13:16:00.000Z');
  });

  test('second transaction — โอนเงินออก 200.00 at 2026-01-09 09:20', () => {
    const t = result.transactions[1];
    expect(t.code).toBe('TTB/โอนเงินออก');
    expect(t.amount).toBe(200);
    expect(t.dateTime).toBe('2026-01-09T09:20:00.000Z');
  });

  test('amounts stored as positive (signed negative in PDF)', () => {
    result.transactions.forEach(t => expect(t.amount).toBeGreaterThan(0));
  });

  test('sName strips BANKCODE + account ref — "SCB X8901 นางสาว ธนัญญา ร" → "นางสาว ธนัญญา ร"', () => {
    expect(result.transactions[0].sName).toBe('นางสาว ธนัญญา ร');
    expect(result.transactions[1].sName).toBe('นางสาว ธนัญญา ร');
  });
});

// ── Krungsri (garbled encoding) ───────────────────────────────────────────────

describe('Krungsri — Krusri.pdf (garbled font encoding)', () => {
  let result: Awaited<ReturnType<typeof parsePDF>>;
  beforeAll(async () => { result = await parsePDF(path.join(PDF_DIR, 'Krusri.pdf')); });

  test('falls back to SCB detection (กรุงศรีอยุธยา unreadable in extracted text)', () => {
    expect(result.bankType).toBe('SCB');
  });

  test('produces 0 transactions (no X1/X2 patterns present in garbled text)', () => {
    expect(result.transactions).toHaveLength(0);
  });
});
