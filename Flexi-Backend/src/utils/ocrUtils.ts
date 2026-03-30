import { createWorker, Worker } from 'tesseract.js';
import sharp from 'sharp';
import path from 'path';
import {
  thaiProvinces,
  generalAddressKeywords,
  receiptTitleKeywords
} from './ocrKeywords';

export interface ExtractedData {
  sName?: string;
  sAddress?: string;
  sTaxId?: string;
  amount?: number;
  date?: string;
  desc?: string;
}

export interface OCRDetectionResult {
  namesFound: string[];
  taxIdsFound: string[];
  taxInvoiceIdsFound: string[];
  vatAmountsFound: string[];
  amountFound: boolean;
  dateFound: boolean;
  addressFound: boolean;
  receiptTitleFound: boolean;
  vatAmountFound: boolean;
  isThaiIdCard: boolean;
  // Add detailed detection results
  amountsDetected: string[];
  datesDetected: string[];
  addressesDetected: string[];
  provincesDetected: string[];
  taxInvoiceIdsDetected: string[];
  vatAmountsDetected: string[];
  summary: {
    hasAtLeast2Names: boolean;
    hasAtLeast1TaxId: boolean;
    hasTaxInvoiceId: boolean;
    hasVatAmount: boolean;
    hasAmount: boolean;
    hasDate: boolean;
    hasAddress: boolean;
    hasReceiptTitle: boolean;
  };
}

export interface OCRResult extends ExtractedData {}

/**
 * Extract full address lines from OCR text
 * Looks for complete address patterns that include house numbers, streets, districts, and provinces
 */
const extractFullAddressLines = (text: string): string[] => {
  const addresses: string[] = [];
  
  // Split text into lines for better address extraction
  const lines = text.split(/[\n\r]+/).map(line => line.trim()).filter(line => line.length > 0);
  
  console.log(`🔍 ANALYZING ${lines.length} lines for address extraction:`);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    console.log(`   Line ${i+1}: LENGTH ${line.length}`);
    
    // If line is too long (likely entire OCR text in one line), extract addresses using regex
    if (line.length > 300) {
      console.log(`      📝 LONG LINE DETECTED - Extracting addresses with regex patterns:`);
      
      // Extract Thai addresses using comprehensive patterns with 4 conditions
      const addressPatterns = [/(\d+(?:\/\d+)?[^\n\r]*?\d{5})/g
      ];
      
      for (const pattern of addressPatterns) {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            // Apply 4-condition validation for addresses:
            // 1. Must start with number (with or without /)
            const startsWithNumber = /^\d+(?:\/\d+)?/.test(match.trim());
            
            // 2. Must end with 5-digit postal code
            const endsWithPostalCode = /\d{5}$/.test(match.trim());
            
            // 3. Must contain Thai province
            const containsProvince = thaiProvinces.some(province => 
              match.toLowerCase().includes(province.toLowerCase())
            );
            
            // 4. Must contain at least one address keyword (generalAddressKeywords or thaiProvinces)
            const containsAddressKeyword = generalAddressKeywords.some(keyword => 
              match.toLowerCase().includes(keyword.toLowerCase())
            ) || containsProvince; // Province already counts as address keyword
            
            // console.log(`      🔍 VALIDATING ADDRESS: "${match}"`);
            // console.log(`         Condition 1 - Starts with number: ${startsWithNumber ? '✅' : '❌'}`);
            // console.log(`         Condition 2 - Ends with postal: ${endsWithPostalCode ? '✅' : '❌'}`);
            // console.log(`         Condition 3 - Contains province: ${containsProvince ? '✅' : '❌'}`);
            // console.log(`         Condition 4 - Contains address keyword: ${containsAddressKeyword ? '✅' : '❌'}`);
            
            // Only proceed if ALL 4 conditions are met
            if (startsWithNumber && endsWithPostalCode && containsProvince && containsAddressKeyword) {
              console.log(`      ✅ ADDRESS VALIDATION PASSED`);
              
              // Clean up the match - remove unwanted elements
              let cleanAddress = match
                .replace(/^fog:\s*/i, '')                                    // Remove fog: prefix
                .replace(/^\d+\.\s*/, '')                                    // Remove number prefixes like "1. "
                .replace(/^[ก-ฮ]\s+\d+\s*/, '')                              // Remove "ก 2" style prefixes
                .replace(/ข้อมูล.*?:/gi, '')                                 // Remove "ข้อมูลบริษัท:" style prefixes
                .replace(/ที่อยู่.*?:/gi, '')                                // Remove "ที่อยู่:" prefixes
                // Remove datetime patterns
                .replace(/\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}\s+[APap][Mm]/g, '') // Remove "10/09/2025 11:58 AM"
                .replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, '')                     // Remove date patterns
                .replace(/\d{1,2}:\d{2}(?:\s*[APap][Mm])?/g, '')             // Remove time patterns
                // Remove phone numbers
                .replace(/\b0\d{9,10}\b/g, '')                               // Remove Thai phone numbers (0854635486)
                .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '')                       // Remove formatted phone numbers
                .replace(/\b\d{10,11}\b/g, '')                               // Remove long number sequences (likely phones)
                // Remove status codes and random text
                .replace(/สถานะ\d+/g, '')                                    // Remove "สถานะ1"
                .replace(/\bEE\b/g, '')                                      // Remove "EE"
                .replace(/=\s*/g, '')                                        // Remove "=" symbols
                .replace(/\b[A-Z]{1,3}\b(?!\s*[ก-ฮ])/g, '')                  // Remove standalone capital letters
                .replace(/\s+/g, ' ')                                        // Normalize spaces
                .trim();
              
              // Further clean - ensure it starts with address number and contains essential address components
              // Look for house number pattern (77/24), building pattern (313 อาคาร), or any number starting pattern
              const houseMatch = cleanAddress.match(/(\d+\/\d+.*)/);
              const buildingMatch = cleanAddress.match(/(\d+\s*อาคาร.*)/);
              const numberStartMatch = cleanAddress.match(/(\d+[^.\n\r]*\d{5})/); // Any number start + postal code
              
              if (houseMatch) {
                cleanAddress = houseMatch[1].trim();
              } else if (buildingMatch) {
                cleanAddress = buildingMatch[1].trim();
              } else if (numberStartMatch) {
                cleanAddress = numberStartMatch[1].trim();
              }
              
              if (cleanAddress.length >= 20) {
                addresses.push(cleanAddress);
                console.log(`      🎯 REGEX EXTRACTED: "${cleanAddress}"`);
              }
            } else {
              console.log(`      ❌ ADDRESS VALIDATION FAILED - Skipping: "${match}"`);
            }
          });
        }
      }
      
      // Also try to extract by looking for specific sequences
      const specificMatches = [
        // SMART PATTERN: Any text starting with number and ending with 5-digit postal code
        line.match(/\d+(?:\/\d+)?[^.\n\r]*?\d{5}/g)
      ].filter(match => match);
      
      specificMatches.forEach(matchArray => {
        if (matchArray) {
          matchArray.forEach(address => {
            // Apply 4-condition validation for addresses:
            // 1. Must start with number (with or without /)
            const startsWithNumber = /^\d+(?:\/\d+)?/.test(address.trim());
            
            // 2. Must end with 5-digit postal code
            const endsWithPostalCode = /\d{5}$/.test(address.trim());
            
            // 3. Must contain Thai province
            const containsProvince = thaiProvinces.some(province => 
              address.toLowerCase().includes(province.toLowerCase())
            );
            
            // 4. Must contain at least one address keyword (generalAddressKeywords or thaiProvinces)
            const containsAddressKeyword = generalAddressKeywords.some(keyword => 
              address.toLowerCase().includes(keyword.toLowerCase())
            ) || containsProvince; // Province already counts as address keyword
            
            // console.log(`      🔍 VALIDATING SPECIFIC ADDRESS: "${address}"`);
            // console.log(`         Condition 1 - Starts with number: ${startsWithNumber ? '✅' : '❌'}`);
            // console.log(`         Condition 2 - Ends with postal: ${endsWithPostalCode ? '✅' : '❌'}`);
            // console.log(`         Condition 3 - Contains province: ${containsProvince ? '✅' : '❌'}`);
            // console.log(`         Condition 4 - Contains address keyword: ${containsAddressKeyword ? '✅' : '❌'}`);
            
            // Only proceed if ALL 4 conditions are met
            if (startsWithNumber && endsWithPostalCode && containsProvince && containsAddressKeyword) {
              console.log(`      ✅ SPECIFIC ADDRESS VALIDATION PASSED`);
              
              // Enhanced cleaning for specific matches
              let cleanAddress = address
                // Remove datetime patterns
                .replace(/\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}\s+[APap][Mm]/g, '')
                .replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, '')
                .replace(/\d{1,2}:\d{2}(?:\s*[APap][Mm])?/g, '')
                // Remove phone numbers
                .replace(/\b0\d{9,10}\b/g, '')
                .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '')
                .replace(/\b\d{10,11}\b/g, '')
                // Remove status codes
                .replace(/สถานะ\d+/g, '')
                .replace(/\bEE\b/g, '')
                .replace(/=\s*/g, '')
                .replace(/\b[A-Z]{1,3}\b(?!\s*[ก-ฮ])/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              
              // Find the house number, building number, or any number start and start from there
              const houseMatch = cleanAddress.match(/(\d+\/\d+.*)/);
              const buildingMatch = cleanAddress.match(/(\d+\s*อาคาร.*)/);
              const numberStartMatch = cleanAddress.match(/(\d+[^.\n\r]*\d{5})/); // Any number start + postal code
              
              if (houseMatch) {
                cleanAddress = houseMatch[1].trim();
              } else if (buildingMatch) {
                cleanAddress = buildingMatch[1].trim();
              } else if (numberStartMatch) {
                cleanAddress = numberStartMatch[1].trim();
              }
              
              if (cleanAddress.length >= 20 && !addresses.includes(cleanAddress)) {
                addresses.push(cleanAddress);
                console.log(`      🎯 SPECIFIC PATTERN EXTRACTED: "${cleanAddress}"`);
              }
            } else {
              console.log(`      ❌ SPECIFIC ADDRESS VALIDATION FAILED - Skipping: "${address}"`);
            }
          });
        }
      });
      
    } else {
      // Original logic for normal-length lines
      // Skip lines that are clearly not addresses
      if (line.length < 10) {
        console.log(`   Line ${i+1}: SKIPPED (too short): "${line}"`);
        continue;
      }
      
      console.log(`   Line ${i+1}: CHECKING: "${line}"`);
      
      // Address indicators that suggest this line contains an address
      const hasAddressIndicators = [
        /^\d+(?:\/\d+)?.*\d{5}$/,                      // BROAD: Starts with number (with/without /) and ends with 5-digit postal code
        /\d+\/\d+/,                                    // House numbers like 77/24, 555/39
        /อาคาร[ก-ฮa-zA-Z\d\s\.\-]{1,50}/,             // อาคาร + building name (like อาคาร ซี.พี.ทาวเวอร์)
        /ชั้น[\d]+/,                                   // ชั้น + floor number (like ชั้น24)
        /ชั้นที่[\d]+/,                                // ชั้นที่ + floor number
        /ห้อง[\d]+/,                                   // ห้อง + room number
        /\d+\s*อาคาร/,                                 // Number + อาคาร (like 313 อาคาร)
        /ซอย.{1,50}[\d]+/,                             // Soi + name + number (with or without spaces)
        /ซอย[ก-ฮa-zA-Z\d\s]{1,50}/,                   // More flexible soi pattern
        /แขวง[ก-ฮ\s]{1,30}/,                           // แขวง + subdistrict (with spaces)
        /แขวง[ก-ฮ]{3,30}/,                             // แขวง + subdistrict (without spaces)
        /เขต[ก-ฮ\s]{1,30}/,                            // เขต + district (with spaces) 
        /เขต[ก-ฮ]{3,30}/,                              // เขต + district (without spaces)
        /อำเภอ[ก-ฮ\s]{1,30}/,                          // อำเภอ + district
        /อำเภอ[ก-ฮ]{3,30}/,                            // อำเภอ + district (no spaces)
        /ตำบล[ก-ฮ\s]{1,30}/,                           // ตำบล + subdistrict
        /ตำบล[ก-ฮ]{3,30}/,                             // ตำบล + subdistrict (no spaces)
        /จังหวัด[ก-ฮ\s]{1,30}/,                        // จังหวัด + province
        /จังหวัด[ก-ฮ]{3,30}/,                          // จังหวัด + province (no spaces)
        /กรุงเทพมหานคร/,                               // Bangkok
        /\d{5}$/,                                      // Ends with postal code
        /ถนน[ก-ฮ\s]{1,30}/,                            // ถนน + street name (with spaces)
        /ถนน[ก-ฮ]{3,30}/,                              // ถนน + street name (without spaces)
      ];
      
      // Check which patterns match for debugging
      const matchingPatterns = hasAddressIndicators.filter(pattern => pattern.test(line));
      const hasIndicators = matchingPatterns.length > 0;
      
      if (hasIndicators) {
        console.log(`      ✅ HAS ADDRESS INDICATORS (${matchingPatterns.length} patterns matched)`);
        matchingPatterns.forEach((pattern, idx) => {
          console.log(`         Pattern ${idx+1}: ${pattern.source}`);
        });
      } else {
        console.log(`      ❌ NO ADDRESS INDICATORS`);
      }
      
      // Additional check: must contain at least one province or Bangkok area
      const hasLocationIndicator = [
        ...thaiProvinces,
        'แขวง', 'เขต', 'อำเภอ', 'ตำบล'
      ].some(location => line.toLowerCase().includes(location.toLowerCase()));
      
      // console.log(`      Location indicator: ${hasLocationIndicator ? '✅' : '❌'}`);
      
      if (hasIndicators && hasLocationIndicator) {
        // Apply 4-condition validation for addresses:
        // 1. Must start with number (with or without /)
        const startsWithNumber = /^\d+(?:\/\d+)?/.test(line.trim());
        
        // 2. Must end with 5-digit postal code
        const endsWithPostalCode = /\d{5}$/.test(line.trim());
        
        // 3. Must contain Thai province
        const containsProvince = thaiProvinces.some(province => 
          line.toLowerCase().includes(province.toLowerCase())
        );
        
        // 4. Must contain at least one address keyword (generalAddressKeywords or thaiProvinces)
        const containsAddressKeyword = generalAddressKeywords.some(keyword => 
          line.toLowerCase().includes(keyword.toLowerCase())
        ) || containsProvince; // Province already counts as address keyword
        
        // console.log(`      🔍 VALIDATING SHORT LINE ADDRESS: "${line}"`);
        // console.log(`         Condition 1 - Starts with number: ${startsWithNumber ? '✅' : '❌'}`);
        // console.log(`         Condition 2 - Ends with postal: ${endsWithPostalCode ? '✅' : '❌'}`);
        // console.log(`         Condition 3 - Contains province: ${containsProvince ? '✅' : '❌'}`);
        // console.log(`         Condition 4 - Contains address keyword: ${containsAddressKeyword ? '✅' : '❌'}`);
        
        // Only proceed if ALL 4 conditions are met
        if (startsWithNumber && endsWithPostalCode && containsProvince && containsAddressKeyword) {
          console.log(`      ✅ SHORT LINE ADDRESS VALIDATION PASSED`);
          
          // Clean up the address line
          let cleanAddress = line
            .replace(/^fog:\s*/i, '')                    // Remove fog: prefix
            .replace(/^\d+\.\s*/, '')                    // Remove number prefixes like "1. "
            .replace(/^[ก-ฮ]\s+\d+\s*/, '')              // Remove "ก 2" style prefixes
            .replace(/ข้อมูล.*?:/gi, '')                 // Remove "ข้อมูลบริษัท:" style prefixes
            .replace(/ที่อยู่.*?:/gi, '')                // Remove "ที่อยู่:" prefixes
            .trim();
          
          // Only add if it's a substantial address (not just a fragment)
          if (cleanAddress.length >= 20 && cleanAddress.includes(' ')) {
            addresses.push(cleanAddress);
            console.log(`      🏠 EXTRACTED: "${cleanAddress}"`);
          } else {
            console.log(`      ⚠️ TOO SHORT OR NO SPACES (length: ${cleanAddress.length}): "${cleanAddress}"`);
          }
        } else {
          console.log(`      ❌ SHORT LINE ADDRESS VALIDATION FAILED - Skipping: "${line}"`);
          // Fallback: try to find an embedded address starting with house number (e.g. "333/33 แขวง...")
          const embeddedMatch = line.match(/(\d+\/\d+[^\n\r]*\d{5})/);
          if (embeddedMatch) {
            const candidate = embeddedMatch[1].trim();
            const cHasProvince = thaiProvinces.some(p => candidate.toLowerCase().includes(p.toLowerCase()));
            const cHasKeyword = generalAddressKeywords.some(k => candidate.toLowerCase().includes(k.toLowerCase())) || cHasProvince;
            if (/\d{5}$/.test(candidate) && cHasProvince && cHasKeyword && candidate.length >= 20) {
              if (!addresses.includes(candidate)) {
                addresses.push(candidate);
                console.log(`      🏠 EMBEDDED ADDRESS EXTRACTED: "${candidate}"`);
              }
            }
          }
        }
      }
    }
  }

  console.log(`🔍 TOTAL ADDRESSES EXTRACTED: ${addresses.length}`);
  return addresses;
};

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://ocr-service:5000';
const TESSERACT_CACHE = path.join(process.cwd(), '.tesseract-cache');
const THAI_ID_KEYWORDS = /thai\s*national\s*id\s*card|บัตรประจำตัวประชาชน|เลขประจำตัวประชาชน/i;

// Persistent workers — created once, reused across requests
let workerEng: Worker | null = null;
let workerThaiEng: Worker | null = null;

async function getEngWorker(): Promise<Worker> {
  if (!workerEng) {
    workerEng = await createWorker('eng', 1, { cachePath: TESSERACT_CACHE });
  }
  return workerEng;
}

async function getThaiEngWorker(): Promise<Worker> {
  if (!workerThaiEng) {
    workerThaiEng = await createWorker(['tha', 'eng'], 1, { cachePath: TESSERACT_CACHE });
  }
  return workerThaiEng;
}

async function runEasyOCR(
  imageBuffer: Buffer,
  onProgress?: (stage: string, progress: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append('file', new Blob([new Uint8Array(imageBuffer)], { type: 'image/jpeg' }), 'image.jpg');

  let response = await fetch(`${OCR_SERVICE_URL}/ocr-stream`, { method: 'POST', body: formData });

  // Fallback: if /ocr-stream not available (old service version), use plain /ocr
  if (response.status === 404) {
    console.log('⚠️ /ocr-stream not found — falling back to /ocr (no real-time progress)');
    const fallbackForm = new FormData();
    fallbackForm.append('file', new Blob([new Uint8Array(imageBuffer)], { type: 'image/jpeg' }), 'image.jpg');
    const fallbackRes = await fetch(`${OCR_SERVICE_URL}/ocr`, { method: 'POST', body: fallbackForm });
    if (!fallbackRes.ok) {
      const errBody = await fallbackRes.text().catch(() => '');
      throw new Error(`OCR service responded with status ${fallbackRes.status}: ${errBody}`);
    }
    const result = await fallbackRes.json() as { text: string; confidence: number };
    console.log(`🔍 EasyOCR (fallback) confidence: ${result.confidence}`);
    return result.text;
  }

  if (!response.ok || !response.body) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`OCR service responded with status ${response.status}: ${errBody}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const data = JSON.parse(line.slice(6)) as { stage: string; progress: number; text?: string; message?: string };
        if (onProgress) onProgress(data.stage, data.progress);
        if (data.stage === 'done' && data.text !== undefined) text = data.text;
        if (data.stage === 'error') throw new Error(`OCR service error: ${data.message}`);
        console.log(`🔍 EasyOCR progress: ${data.stage} ${data.progress}%`);
      } catch (e: any) {
        if (e.message?.startsWith('OCR service error')) throw e;
        // ignore JSON parse errors on partial lines
      }
    }
  }

  return text;
}

export const extractTextFromImage = async (
  imageBuffer: Buffer,
  onProgress?: (stage: string, progress: number) => void
): Promise<OCRDetectionResult> => {
  const yield_ = () => new Promise<void>(r => setImmediate(r));

  try {
    console.log(`🔍 Buffer size: ${imageBuffer.length} bytes, first 4 bytes: ${imageBuffer.subarray(0, 4).toString('hex')}`);

    // Fire immediately so the progress bar starts moving before any heavy work
    if (onProgress) { onProgress('preprocessing', 8); await yield_(); }

    // Convert to JPEG — Tesseract.js can't read HEIC/AVIF; sharp may not have HEIC support compiled in
    let jpegBuffer: Buffer | null = null;
    try {
      jpegBuffer = await sharp(imageBuffer).jpeg().toBuffer();
    } catch {
      console.log('⚠️ sharp cannot decode this format (likely HEIC) — routing directly to EasyOCR');
    }

    let text: string;

    if (!jpegBuffer) {
      // Unsupported by sharp (HEIC etc.) — EasyOCR Python service handles these via pillow-heif
      console.log('🪪 Sending to EasyOCR (format not supported by Tesseract)...');
      text = await runEasyOCR(imageBuffer, onProgress);
    } else {
      // Quick English-only Tesseract pass to detect Thai ID card
      if (onProgress) { onProgress('quick_scan', 12); await yield_(); }
      console.log('🔍 Quick Tesseract scan (eng) for document type detection...');
      const engWorker = await getEngWorker();
      const { data: { text: quickText } } = await engWorker.recognize(jpegBuffer);

      if (THAI_ID_KEYWORDS.test(quickText)) {
        console.log('🪪 Thai ID card detected — running EasyOCR for accurate Thai extraction...');
        text = await runEasyOCR(imageBuffer, onProgress);
      } else {
        console.log('📄 Regular document — running full Tesseract (tha+eng)...');
        if (onProgress) { onProgress('preprocessing', 15); await yield_(); }
        const thaiWorker = await getThaiEngWorker();
        if (onProgress) { onProgress('ocr_running', 35); await yield_(); }
        const { data: { text: fullText } } = await thaiWorker.recognize(jpegBuffer);
        if (onProgress) { onProgress('processing', 85); await yield_(); }

        // Check if Tesseract produced meaningful text
        // "Meaningful" = at least 10 Thai or Latin alphanumeric characters
        const meaningfulChars = (fullText.match(/[\u0E00-\u0E7Fa-zA-Z0-9]/g) ?? []).length;
        if (meaningfulChars < 10) {
          console.log(`⚠️ Tesseract returned low-quality text (${meaningfulChars} meaningful chars) — falling back to EasyOCR...`);
          if (onProgress) { onProgress('easyocr_fallback', 87); await yield_(); }
          text = await runEasyOCR(imageBuffer, (stage, pct) => {
            // Remap EasyOCR's 15–100 into 87–100 band
            const mapped = 87 + Math.round((pct / 100) * 13);
            if (onProgress) onProgress(stage, Math.min(mapped, 100));
          });
          console.log('✅ EasyOCR fallback complete');
        } else {
          if (onProgress) { onProgress('done', 100); await yield_(); }
          text = fullText;
        }
      }
    }

    console.log('🔍 Raw extracted text:', text);
    return detectDataPresence(text);
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      namesFound: [],
      taxIdsFound: [],
      taxInvoiceIdsFound: [],
      vatAmountsFound: [],
      amountFound: false,
      dateFound: false,
      addressFound: false,
      receiptTitleFound: false,
      vatAmountFound: false,
      isThaiIdCard: false,
      amountsDetected: [],
      datesDetected: [],
      addressesDetected: [],
      provincesDetected: [],
      taxInvoiceIdsDetected: [],
      vatAmountsDetected: [],
      summary: {
        hasAtLeast2Names: false,
        hasAtLeast1TaxId: false,
        hasTaxInvoiceId: false,
        hasVatAmount: false,
        hasAmount: false,
        hasDate: false,
        hasAddress: false,
        hasReceiptTitle: false
      }
    };
  }
};

/**
 * Detect presence of data elements in text without selecting specific values
 */
const extractThaiIdCardData = (rawText: string): { name: string | null; idNumber: string | null; address: string | null } => {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // --- Name: Thai title + first + last name on the same line (no cross-line match) ---
  let name: string | null = null;
  for (const line of lines) {
    const m = line.match(/^.*?(?:น\.?ส\.?|นางสาว|นาย|นาง(?!สาว))[^\S\n]*([ก-๙]+(?:[^\S\n]+[ก-๙]+)+)/);
    if (m) {
      name = m[1].trim();
      break;
    }
  }

  // --- ID number: X XXXX XXXXX XX X (13 digits with spaces) ---
  let idNumber: string | null = null;
  const idMatch = rawText.match(/(\d)\s+(\d{4})\s+(\d{5})\s+(\d{2})\s+(\d)/);
  if (idMatch) {
    idNumber = idMatch.slice(1).join('');
  }

  // --- Address: collect all candidate lines around ที่อยู่, parse components, reassemble in order ---
  const thaiProvincePattern = /กรุงเทพมหานคร|กรุงเทพฯ|[ก-๙]+(?:บุรี|นคร|ธานี|สงขลา|ภูเก็ต|เชียงใหม่|ขอนแก่น|อุดรธานี|นครราชสีมา|นนทบุรี|ปทุมธานี|สมุทร[ก-๙]+)/;
  let address: string | null = null;
  const addressLabelIdx = lines.findIndex(l => /ที่อยู่|ที่อยุ่/.test(l));
  if (addressLabelIdx !== -1) {
    // Gather candidate lines: up to 4 before + all after (until expiry/dates)
    const candidates: string[] = [];
    for (let i = Math.max(0, addressLabelIdx - 4); i < lines.length; i++) {
      if (i === addressLabelIdx) continue; // skip the label itself
      const line = lines[i];
      if (i > addressLabelIdx) {
        if (/วันออก|วันบัตร|วันหมด|date.*issu|date.*expir|เจ้าหน้าที่|เจ้าพนักงาน/i.test(line)) break;
        if (/^[l1Ilo0\s\d]+$/.test(line)) continue;
      }
      if (/[ก-๙]/.test(line) || /\d+\/\d+/.test(line)) {
        candidates.push(line.replace(/^\./, 'ถ.')); // fix leading '.' OCR noise
      }
      if (i > addressLabelIdx && thaiProvincePattern.test(line)) break;
    }

    // Parse address components from all candidates
    const joined = candidates.join(' ').replace(/\s+/g, ' ');
    const houseMatch  = joined.match(/(\d+\/\d+|\d+)\s*(?=ถ\.|ซ\.|แขวง|เขต|ตำบล|อำเภอ|$)/);
    const soiMatch    = joined.match(/ซ(?:อย)?\.?\s*([ก-๙a-zA-Z0-9\s]+?)(?=\s*(?:ถ\.|แขวง|ตำบล|เขต|อำเภอ|กรุงเทพ|จังหวัด|$))/);
    const roadMatch   = joined.match(/ถ(?:นน)?\.?\s*([ก-๙a-zA-Z0-9\s]+?)(?=\s*(?:แขวง|ตำบล|เขต|อำเภอ|กรุงเทพ|จังหวัด|$))/);
    const subDistMatch= joined.match(/(?:แขวง|ตำบล)\s*([ก-๙]+)/);
    const distMatch   = joined.match(/(?:เขต|อำเภอ)\s*([ก-๙]+)/);
    const provMatch   = joined.match(thaiProvincePattern);

    const parts: string[] = [];
    if (houseMatch)   parts.push(houseMatch[1].trim());
    if (soiMatch)     parts.push(`ซ.${soiMatch[1].trim()}`);
    if (roadMatch)    parts.push(`ถ.${roadMatch[1].trim()}`);
    if (subDistMatch) parts.push(`แขวง${subDistMatch[1].trim()}`);
    if (distMatch)    parts.push(`เขต${distMatch[1].trim()}`);
    if (provMatch)    parts.push(provMatch[0].trim());

    if (parts.length > 0) {
      address = parts.join(' ');
    }
  }

  return { name, idNumber, address };
};

export const detectDataPresence = (text: string): OCRDetectionResult => {
  // Clean up the text - remove extra whitespace and normalize
  const cleanText = text.replace(/\s+/g, ' ').trim();
  console.log('🔍 Starting data detection...');

  // --- Thai National ID Card detection ---
  const isThaiIdCard = /thai\s*national\s*id\s*card|บัตรประจำตัวประชาชน|บัตรประชาชน|เลขประจำตัวประชาชน/i.test(cleanText);
  if (isThaiIdCard) {
    console.log('🪪 Thai National ID Card detected — using ID card extraction patterns');
  }
  
  // Initialize arrays to collect actual detected values
  const detectedAmounts: string[] = [];
  const detectedDates: string[] = [];
  const detectedAddresses: string[] = [];
  const detectedProvinces: string[] = [];
  const detectedTaxInvoiceIds: string[] = [];
  
  // 1. Detect Names
  const namePatterns = [
  // English-style company names (capture suffixes like CO.,LTD, LTD, LIMITED, INC)
  /([A-Za-z0-9\.\,\-\s]{3,}?(?:Co\.?\,?\s*LTD\.?|CO\.?\,?\s*LTD\.?|LTD\.?|LIMITED|Company|CORP|INC\.?))/gi,
    // Company names with prefixes and endings - Enhanced for บมจ. ซีพี ออลล์
    /(?:ห้างหุ้นส่วนจำกัด|ห้างหุ้นส่วนจํากัด|บจก\.?\s*|บมจ\.?\s*)\s*([^.\n\r;,]*?)(?:\s*จำกัด\s*(?:มหาชน)?|\s*จํากัด\s*(?:มหาชน)?|$)/gi,
    // Personal names with titles
    /(?:จำกัด|จํากัด|นาง|นาย|นางสาว|นส\.?|คุณ)\s?([^\n\r.;,]+)/gi,
    // บริษัท pattern - Enhanced to capture FULL company name including บริษัท prefix
    /(บริษัท\s+[^.\n\r;,]*?(?:\s*จำกัด\s*(?:มหาชน|\(มหาชน\))?|\s*จํากัด\s*(?:มหาชน|\(มหาชน\))?|$))/gi,
    // ชื่อบริษัท pattern - also capture full name
    /ชื่อบริษัท:\s*(บริษัท\s+[^.\n\r;,]*?(?:จำกัด\s*(?:มหาชน|\(มหาชน\))?|จํากัด\s*(?:มหาชน|\(มหาชน\))?))/gi,
    // Digitally Signed By pattern - extract company name from digital signatures
    /Digitally\s+Signed\s+By\s+(บริษัท\s+[^.\n\r;,]*?(?:\s*จำกัด\s*(?:มหาชน|\(มหาชน\))?|\s*จํากัด\s*(?:มหาชน|\(มหาชน\))?)?)/gi,
    // Individual customer names after ลูกค้า
    /ลูกค้า[^ก-๙a-zA-Z]*([ก-๙]+\s+[ก-๙]+)(?:\s+การ|\s+\d|\s+วันที่|$)/gi
  ];

  

  const namesFound: string[] = [];

  for (const pattern of namePatterns) {
    let match;
    while ((match = pattern.exec(cleanText)) !== null) {
      if (match && (match[0] || match[1])) {
        let fullName = '';
        
        if (match[1]) {
          fullName = match[1].trim();
        } else if (match[0]) {
          fullName = match[0].trim();
        }
        
        // Basic cleaning
        fullName = fullName.replace(/^ชื่อบริษัท:\s*/i, '').trim();
        fullName = fullName.replace(/หมายเลขผู้เสียภาษี.*$/i, '').trim();
        fullName = fullName.replace(/วันที่.*$/i, '').trim();
        fullName = fullName.replace(/\d{13}.*$/i, '').trim();
        fullName = fullName.replace(/เอกสารนี.*$/i, '').trim();
        fullName = fullName.replace(/การ.*$/i, '').trim();
        // Remove phone numbers so they don't trigger address detection
        fullName = fullName.replace(/\b0\d{8,9}\b/g, '').trim();
        // Remove tax-label suffixes that follow the company name
        fullName = fullName.replace(/เลขประจํา.*$/i, '').trim();
        fullName = fullName.replace(/เลขประจำ.*$/i, '').trim();
        fullName = fullName.replace(/เลขผู้เสียภาษี.*$/i, '').trim();
        // Normalize whitespace
        fullName = fullName.replace(/\s+/g, ' ').trim();
        
        if (fullName.startsWith('จํากัด ') || fullName.startsWith('จำกัด ')) {
          fullName = fullName.replace(/^(จํากัด|จำกัด)\s+/, '').trim();
        }
        
        // Filter out addresses that are mistakenly detected as names
        const addressIndicators = [
          // House number patterns
          /^\d+\/\d+/i,  // 555/39, 123/45, etc.
          /^fog:\s*\d+/i,  // fog: 555/39
          // Address keywords
          /หมู่บ้าน|หมู่\s*\d+|ซอย|ถนน|แขวง|เขต|อำเภอ|ตำบล|จังหวัด/i,
          // Thai provinces
          /กรุงเทพมหานคร|นครปฐม|นนทบุรี|ปทุมธานี|สมุทรปราการ|สมุทรสงคราม|สมุทรสาคร/i,
          /เชียงใหม่|เชียงราย|ลำปาง|ลำพูน|แพร่|น่าน|พะเยา|แม่ฮ่องสอน/i,
          /ขอนแก่น|นครราชสีมา|อุดรธานี|อุบลราชธานี|สุรินทร์|บุรีรัมย์|ศรีสะเกษ|ยโสธร/i,
          /ชลบุรี|ระยอง|จันทบุรี|ตราด|ปราจีนบุรี|ฉะเชิงเทรา|สระแก้ว/i,
          /ภูเก็ต|กระบี่|พังงา|ตรัง|สุราษฎร์ธานี|นครศรีธรรมราช|สงขลา|ปัตตานี|ยะลา|นราธิวาส/i,
          // Postal code pattern (5 digits)
          /\d{5}/,
          // Common address terms
          /รามอินทรา|วิภาวดี|พหลโยธิน|งามวงศ์วาน|บางนา|สุขุมวิท|เพชรบุรี|ราชดำริ/i,
          // Building/village names that look like addresses
          /พลีโน่|จตุโชติ|ไทยรามัญ|สามวาตะวันตก|คลองสามวา/i
        ];
        
        // Check if this looks like an address
        const isAddress = addressIndicators.some(pattern => pattern.test(fullName));
        
        if (!isAddress && fullName.length > 3 && fullName.length < 150) {
          if (!namesFound.includes(fullName)) {
            namesFound.push(fullName);
          }
        } else if (isAddress) {
          // Instead of just filtering out, collect as address
          // Clean up the address by removing "fog:" prefix
          let cleanAddress = fullName.replace(/^fog:\s*/i, '').trim();
          
          if (!detectedAddresses.includes(cleanAddress)) {
            detectedAddresses.push(cleanAddress);
          }
          console.log(`🏠 Collected address: ${cleanAddress}`);
        }
      }
    }
    pattern.lastIndex = 0;
  }

  console.log(`🔍 NAMES DETECTED: ${namesFound.length} names found`, namesFound);
  // Clean up detected names: remove known receipt/invoice title tokens that may be
  // prefixed to company names by noisy OCR and filter out names that are only
  // title phrases.
  const receiptTitleTokens = [
    'ใบแจ้งหนี้', 'ใบคํากับภาษี', 'ใบกำกับภาษี', 'ใบส่งของ', 'ใบเสร็จ', 'ใบเสร็จรับเงิน'
  ];

  const normalizeName = (n: string) => {
    let s = n.trim();
    // Remove common separators and equal signs that appear in OCR'd titles
    s = s.replace(/[=\/]+/g, ' ').replace(/:+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    // Remove any receipt title tokens that appear anywhere in the string
    for (const token of receiptTitleTokens) {
      const re = new RegExp(token, 'gi');
      s = s.replace(re, '').trim();
    }
    return s;
  };

  // Pre-seed authoritative Thai company names from the raw text.
  // This ensures full matches like "บริษัท ซีพี ออลล์ จํากัด (มหาชน)" are captured
  // before later normalization or overlapping regexes can split them.
  try {
    // Match full Thai company names, tolerant of either 'จำกัด' or 'จํากัด' spellings,
    // and optional '(มหาชน)' after the จำกัด token.
    const authoritativeCompanyPattern = /(บริษัท\s+[\s\S]{3,}?(?:จำกัด|จํากัด)(?:\s*(?:มหาชน|\(มหาชน\))?))/gi;
    let acMatch: RegExpExecArray | null;
    while ((acMatch = authoritativeCompanyPattern.exec(cleanText)) !== null) {
      const comp = acMatch[1].replace(/\s+/g, ' ').trim();
      if (comp.length > 3 && !namesFound.includes(comp)) {
        namesFound.push(comp);
        console.log(`🔍 PRE-SEEDED COMPANY NAME: "${comp}"`);
      }
    }
  } catch (e) {
    // defensive: if RegExp with unicode/flags fails in some runtime, continue gracefully
    console.log('⚠️ Pre-seed company name extraction failed:', e);
  }
  const cleanedNames: string[] = [];
for (const rawName of namesFound) {
  const cleaned = normalizeName(rawName);
  console.log(`🔍 Processing name: "${rawName}" -> cleaned: "${cleaned}"`);
  
  // Exclude entries that become empty or are too short after normalization
  if (!cleaned || cleaned.length < 3) {
    console.log(`   ❌ Skipped: too short (${cleaned?.length || 0} chars)`);
    continue;
  }
  
  // Special protection for legitimate Thai company names
  const isThaiCompany = /บริษัท.*จ[ำํ]ากัด/.test(cleaned);
  console.log(`   🏢 Is Thai company: ${isThaiCompany}`);
  
  // Exclude names that are just generic title words (but protect company names)
  const lower = cleaned.toLowerCase();
  let isReceiptTitle = false;
  
  if (!isThaiCompany) {
    // Only apply receipt title filtering to non-company names
    for (const token of receiptTitleTokens) {
      if (lower.includes(token.toLowerCase())) {
        // Additional check: only exclude if the token makes up a significant portion
        const tokenLength = token.length;
        const cleanedLength = cleaned.length;
        const ratio = tokenLength / cleanedLength;
        
        if (ratio > 0.7) { // Only exclude if receipt title token is >70% of the name
          isReceiptTitle = true;
          console.log(`   ❌ Skipped: contains receipt title token "${token}" (ratio: ${ratio.toFixed(2)})`);
          break;
        } else {
          console.log(`   ⚠️ Contains receipt title token "${token}" but ratio too low (${ratio.toFixed(2)}) - keeping`);
        }
      }
    }
  } else {
    console.log(`   ✅ Thai company detected - skipping receipt title check`);
  }
  
  if (isReceiptTitle) continue;

  // Plausibility checks to reject gibberish
  const thaiLetters = (cleaned.match(/[ก-๙]/g) || []).length;
  const asciiWords = (cleaned.match(/[A-Za-z]{3,}/g) || []).length;
  console.log(`   📊 Thai letters: ${thaiLetters}, ASCII words: ${asciiWords}`);
  
  if (thaiLetters < 2 && asciiWords < 1) {
    console.log(`   ❌ Skipped: not enough valid characters`);
    continue;
  }

  // Limit ratio of non-word characters (punctuation/digits)
  // Move the hyphen to the end of the class to avoid creating a range with \p{...}
  const nonWord = (cleaned.match(/[^\p{L}\p{N}\s-]/gu) || []).length;
  const total = cleaned.length || 1;
  const nonWordRatio = nonWord / total;
  console.log(`   📊 Non-word ratio: ${nonWordRatio.toFixed(2)} (${nonWord}/${total})`);
  
  if (nonWordRatio > 0.55) {
    console.log(`   ❌ Skipped: too many non-word characters`);
    continue;
  }

  // Reject fragments that start with a Thai vowel/tone mark (e.g. "าขาพิเศษ 2" from "สาขาพิเศษ")
  if (/^[าิีึืุูเแโใไ็่้๊๋์ํ]/.test(cleaned)) {
    console.log(`   ❌ Skipped: starts with Thai vowel/tone mark (fragment)`);
    continue;
  }

  // Reject standalone prefix words with no actual name attached
  if (/^บริษัท\s*$|^ห้างหุ้นส่วน\s*$|^นาย\s*$|^นาง\s*$|^น\.ส\.\s*$/.test(cleaned)) {
    console.log(`   ❌ Skipped: prefix word only, no name`);
    continue;
  }

  // Reject legal/document boilerplate (long strings with document keywords)
  if (cleaned.length > 60 && /เอกสาร|จัดทํา|จัดทำ|กรมสรรพากร|ข้อมูล|ฉบับนี้|ส่งข้อมูล/.test(cleaned)) {
    console.log(`   ❌ Skipped: legal/document boilerplate`);
    continue;
  }

  if (!cleanedNames.includes(cleaned)) {
    cleanedNames.push(cleaned);
    console.log(`   ✅ KEPT: "${cleaned}"`);
  } else {
    console.log(`   ⚠️ Duplicate: "${cleaned}"`);
  }
}

console.log(`🔍 NAMES CLEANED: ${cleanedNames.length} names kept`);
cleanedNames.forEach((name, index) => {
  console.log(`   ${index + 1}. ${name}`);
});

  // Further refine cleaned names: extract explicit 'บริษัท ... จำกัด' if present,
  // and strip trailing noisy tokens (dates, separators, words like 'รับเงิน', 'ในนาม').
  const noisyTokens = ['รับเงิน', 'รับเช็ค', 'ในนาม', 'ผู้จ่ายเงิน', 'ผู้รับเงิน', 'รับเงิน', 'จํานวนเงินรวมทั้งสิ้น', 'จํานวนเงินรวม'];
  const companyPattern = /(บริษัท\s+[^\d\n\r\|\[\]<>\\\/]{3,}?(?:จำกัด\s*(?:มหาชน)?|จํากัด\s*(?:มหาชน)?))/i;

  const finalNames: string[] = [];
  for (let name of cleanedNames) {
    // Strip at first occurrence of common separators that indicate trailing noise
    name = name.split(/[|\\\[\]<>%\/]/)[0].trim();

    // Remove any noisy token words
    for (const tk of noisyTokens) {
      const re = new RegExp(tk, 'gi');
      name = name.replace(re, '').trim();
    }

    // Remove trailing date-like sequences
    name = name.replace(/\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}.*$/,'').trim();

      // Try to extract 'บริษัท ... จำกัด' as authoritative company name
      const m = name.match(companyPattern);
      if (m && m[1]) {
        const extracted = m[1].replace(/\s+/g, ' ').trim();
        if (!finalNames.includes(extracted)) finalNames.push(extracted);
        continue;
      }

      // Try to extract English-style company names like 'NAPAT PACKAGING CO.,LTD'
      // Match sequences with common suffixes and avoid trailing numeric/amount fragments
      const engCompanyPattern = /([A-Za-z0-9\-\.,\s]{3,}?(?:\bCo\.?\b|\bCO\.?\b|\bLTD\.?\b|\bLIMITED\b|\bCompany\b|\bCORP\b|\bINC\.?\b))[\.,\s]*$/i;
      const me = name.match(engCompanyPattern);
      if (me && me[1]) {
        let extracted = me[1].replace(/\s{2,}/g, ' ').trim();
        // Normalize common suffix punctuation
        extracted = extracted.replace(/\bCo\.?\s*,?\s*LTD\.?/i, 'CO.,LTD');
        extracted = extracted.replace(/\s+$/,'');
        // Remove trailing numbers or amount fragments
        extracted = extracted.replace(/[,\s]*\d+[\.,]?\d*$/,'').trim();
        if (!finalNames.includes(extracted)) finalNames.push(extracted);
        continue;
      }

      // Fallback: keep only entries that appear to be company-like (contain letters and not too many digits)
      if (name && name.length >= 4) {
        const digitRatio = (name.match(/\d/g) || []).length / (name.length || 1);
        if (digitRatio < 0.2) {
          name = name.replace(/^[^\p{L}0-9]+|[^\p{L}0-9]+$/gu, '').trim();
          if (name && !finalNames.includes(name)) finalNames.push(name);
        }
      }
  }

  // Replace contents of original namesFound array with finalNames
  namesFound.length = 0;
  finalNames.forEach(n => namesFound.push(n));

  // 2. Detect Tax IDs
  const taxIdPatterns = [
    /\b(\d{13})\b/g,
    /\b(\d{1})\s*-\s*(\d{4})\s*-\s*(\d{2})\s*-\s*(\d{3})\s*-\s*(\d{3})\b/g,
    /\b(\d{1})\s+(\d{4})\s+(\d{5})\s+(\d{2})\s+(\d{1})\b/g,
    /\b(\d{1})\s*[-\s]\s*(\d{4})\s*[-\s]\s*(\d{2,5})\s*[-\s]\s*(\d{2,3})\s*[-\s]?\s*(\d{1,3})\b/g
  ];

  const taxIdsFound: string[] = [];

  for (const pattern of taxIdPatterns) {
    let match;
    while ((match = pattern.exec(cleanText)) !== null) {
      let taxId: string;
      
      if (match[1] && match[1].length === 13) {
        taxId = match[1];
      } else if (match.length > 1) {
        taxId = match.slice(1).filter(group => group).join('');
      } else {
        continue;
      }
      
      taxId = taxId.replace(/[\s\-]/g, '');
      
      if (taxId && taxId.length === 13 && /^\d{13}$/.test(taxId)) {
        if (!taxIdsFound.includes(taxId)) {
          taxIdsFound.push(taxId);
        }
      }
    }
    pattern.lastIndex = 0;
  }

  console.log(`🔍 TAX IDs DETECTED: ${taxIdsFound.length} tax IDs found`);
  taxIdsFound.forEach((taxId, index) => {
    console.log(`   ${index + 1}. ${taxId}`);
  });

  // 3. Detect Tax Invoice IDs
  const taxInvoiceIdPatterns = [
    // English patterns
    /(?:ID|id|Id)\s*:?\s*([A-Za-z0-9\-\_\/]+)/gi,
    /(?:id\s*-|ID\s*-)\s*([A-Za-z0-9\-\_\/]+)/gi,
    /(?:billid|bill\s*id)\s*:?\s*([A-Za-z0-9\-\_\/]+)/gi,
    /(?:no\.|number\s*id)\s*:?\s*([A-Za-z0-9\-\_\/]+)/gi,
    
    // Thai patterns
    /(?:เลขที่)\s*:?\s*([A-Za-z0-9ก-๙\-\_\/\s]+)/gi,
    /(?:บิลเลขที่)\s*:?\s*([A-Za-z0-9ก-๙\-\_\/\s]+)/gi,
    /(?:เลขที่บิล)\s*:?\s*([A-Za-z0-9ก-๙\-\_\/\s]+)/gi,
    /(?:เลขที่เอกสาร)\s*:?\s*([A-Za-z0-9ก-๙\-\_\/\s]+)/gi,
    /(?:เอกสารเลขที่)\s*:?\s*([A-Za-z0-9ก-๙\-\_\/\s]+)/gi,
    /(?:เล่มที่\/เลขที่)\s*:?\s*([A-Za-z0-9ก-๙\-\_\/\s]+)/gi,
    
    // General pattern for invoice numbers (letters + numbers)
    /\b([A-Za-z]{1,4}\d{4,}|\d{4,}[A-Za-z]{1,4}|[A-Za-z0-9]{6,})\b/g
  ];

  const taxInvoiceIdsFound: string[] = [];

  for (const pattern of taxInvoiceIdPatterns) {
    let match;
    while ((match = pattern.exec(cleanText)) !== null) {
      if (match && match[1]) {
        let invoiceId = match[1].trim();
        
        // Keep only valid invoice ID characters — strip trailing Thai/noise
        invoiceId = invoiceId.replace(/[^A-Za-z0-9\-\_\/]/g, ' ').trim().split(/\s+/)[0];
        
        // Filter out obvious non-invoice IDs (like tax IDs, phone numbers, etc.)
        const isValidInvoiceId = (id: string): boolean => {
          // Skip if it doesn't contain any numbers
          if (!/\d/.test(id)) return false;
          
          // Skip if it's a 13-digit tax ID
          if (/^\d{13}$/.test(id.replace(/[\s\-]/g, ''))) return false;
          
          // Skip if it's a phone number pattern
          if (/^0\d{9,10}$/.test(id.replace(/[\s\-]/g, ''))) return false;
          
          // Skip if it's a postal code
          if (/^\d{5}$/.test(id)) return false;
          
          // Skip if it's too short or too long
          if (id.length < 3 || id.length > 50) return false;
          
          // Skip if it's just numbers and looks like amount/date
          if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(id)) return false;
          if (/^\d+\.\d{2}$/.test(id)) return false;
          
          return true;
        };
        
        if (isValidInvoiceId(invoiceId)) {
          if (!taxInvoiceIdsFound.includes(invoiceId)) {
            taxInvoiceIdsFound.push(invoiceId);
            detectedTaxInvoiceIds.push(invoiceId); // Also add to detected array
          }
        }
      }
    }
    pattern.lastIndex = 0;
  }

  // Remove IDs that are a prefix of a longer ID already captured (e.g. "REC2026" when "REC2026/001" exists)
  const deduplicatedInvoiceIds = taxInvoiceIdsFound.filter(
    id => !taxInvoiceIdsFound.some(longer => longer !== id && longer.startsWith(id))
  );
  taxInvoiceIdsFound.length = 0;
  deduplicatedInvoiceIds.forEach(id => taxInvoiceIdsFound.push(id));
  detectedTaxInvoiceIds.length = 0;
  deduplicatedInvoiceIds.forEach(id => detectedTaxInvoiceIds.push(id));

  console.log(`🔍 TAX INVOICE IDs DETECTED: ${taxInvoiceIdsFound.length} invoice IDs found`);
  taxInvoiceIdsFound.forEach((invoiceId, index) => {
    console.log(`   ${index + 1}. ${invoiceId}`);
  });

  // 4. Detect Amount
  const amountPatterns = [
    /(?:Total|ทั้งหมด|รวม|รวมทั้งหมด|ยอดรวม|จำนวนเงินทั้งสิ้น|จำนวนเงินรวม)\s*:?\s*([0-9,]+\.?\d*)/gi,
    /(?:Total|ทั้งหมด|รวม|รวมทั้งหมด|ยอดรวม|จำนวนเงินทั้งสิ้น|จำนวนเงินรวม)\s*:?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
    /(?:Total|TOTAL)\s*:?\s*฿?\s*([0-9,]+\.?\d*)/gi
  ];

  // Additional flexible patterns to catch OCR variations and currency suffixes like THB or บาท
  const extraAmountPatterns = [
    /(?:ยอดรวมทั้งหมด|ยอดรวมทังหมด|ยอดรวม:)\s*([0-9,]+\.?\d*)/gi, // common Thai OCR typo ทัง -> ทั้ง
    /(?:ยอดรวมทังหมด|ยอดรวมทั้งหมด|ยอดรวม)\s*[:\-]?\s*([0-9\.,]+)\s*(?:THB|thb|บาท)?/gi,
    /([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{1,2})?)\s*(?:THB|thb|บาท)/gi, // numbers with thousands separators followed by currency
    /([0-9]+\.[0-9]{2})\s*THB/gi,
    /(?:รวมทั้งสิ้น|รวมทั้งหมด|รวม:?)\s*([0-9,]+\.?\d*)/gi,
    /(?:ยอดรวมทังหมด)\s*[:\s]{1,40}([0-9,]+\.?\d*)/gi, // allow many spaces/cols due to OCR 
    /(?:ยอดช[ํำ]าระ)\s*[:\s]{1,60}([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/gi,
  
  ];

  let amountFound = false;
  // First pass: high-confidence patterns
  for (const pattern of amountPatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      if (match && match[1]) {
        const amountStr = match[1].replace(/,/g, '');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > 0) {
          amountFound = true;
          detectedAmounts.push(amount.toString());
          console.log(`🔍 AMOUNT DETECTED (primary): ${amount} (${match[1]})`);
          break;
        }
      }
    }
    if (amountFound) break;
  }

  // Second pass: more flexible patterns for OCR typos and currency suffixes
  if (!amountFound) {
    for (const pattern of extraAmountPatterns) {
      const matches = cleanText.matchAll(pattern);
      for (const match of matches) {
        if (match && match[1]) {
          const amountStr = match[1].replace(/[,\s]/g, '').replace(/\.+(?=.*\.)/g, '');
          const amount = parseFloat(amountStr);
          if (!isNaN(amount) && amount > 0) {
            amountFound = true;
            detectedAmounts.push(amount.toString());
            console.log(`🔍 AMOUNT DETECTED (extra): ${amount} (${match[1]}) from pattern ${pattern.source}`);
            break;
          }
        }
      }
      if (amountFound) break;
    }
  }

  // Fallback: pick the largest currency-like number found in the text (useful when labels are OCR-mangled)
  if (!amountFound) {
    // Strip tax IDs and phone numbers so their digit sub-sequences can't pollute amount candidates
    let textForAmountFallback = cleanText;
    for (const taxId of taxIdsFound) {
      textForAmountFallback = textForAmountFallback.replace(taxId, '');
    }
    textForAmountFallback = textForAmountFallback.replace(/\b0\d{8,9}\b/g, ''); // Thai phone numbers
    // Find all numbers that look like currency (with commas or decimals) and are not dates (dd/mm/yyyy)
    const currencyLike = Array.from(textForAmountFallback.matchAll(/\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+\.\d{2}/g)).map(m => m[0]);
    const candidates: number[] = [];
    for (const c of currencyLike) {
      // skip things that look like dates (e.g., 10/09/2025 already removed earlier) and postal codes
      const sanitized = c.replace(/,/g, '');
      const num = parseFloat(sanitized);
      if (!isNaN(num) && num > 0) candidates.push(num);
    }
    if (candidates.length > 0) {
      const maxAmount = Math.max(...candidates);
      amountFound = true;
      detectedAmounts.push(maxAmount.toString());
      console.log(`🔍 AMOUNT DETECTED (fallback largest): ${maxAmount}`);
    }
  }

  if (!amountFound) {
    console.log('❌ AMOUNT NOT DETECTED');
  }

  // 5. Detect VAT Amount
  const vatAmountPatterns = [
    // MOST SPECIFIC PATTERNS FIRST - End of line VAT amounts (highest priority)
    /(?:ภาษีมูลค่าเพิ่ม)\s*([0-9,]+\.?\d*)\s*(?:THB)?\s*$/gim, // VAT amount at end of line
    /(?:จำนวนภาษีมูลค่าเพิ่ม)\s*([0-9,]+\.?\d*)\s*(?:THB)?\s*$/gim, // VAT amount at end of line
    /(?:ภาษี)\s*(?:\(7%\))\s*:\s*([0-9,]+\.?\d*)\s*(?:THB)?\s*$/gim, // "ภาษี (7%):" at end of line
    /(?:ภาษี)\s*(?:\(๗%\))\s*:\s*([0-9,]+\.?\d*)\s*(?:THB)?\s*$/gim, // "ภาษี (๗%):" at end of line
    /(?:VAT|vat|Vat)\s*([0-9,]+\.?\d*)\s*(?:THB)?\s*$/gim, // English VAT at end of line
    /(?:VAT)\s*(?:\(7%\))\s*:\s*([0-9,]+\.?\d*)\s*(?:THB)?\s*$/gim, // "VAT (7%):" at end of line
    
    // SPECIFIC PATTERN - VAT amount preceded by lots of spaces (receipt formatting)
    /(?:ภาษีมูลค่าเพิ่ม)\s{20,}([0-9,]+\.?\d*)/gi, // VAT with 20+ spaces before amount
    /(?:จำนวนภาษีมูลค่าเพิ่ม)\s{20,}([0-9,]+\.?\d*)/gi, // VAT with 20+ spaces before amount
    /(?:ภาษี)\s*(?:\(7%\))\s*:\s{10,}([0-9,]+\.?\d*)/gi, // "ภาษี (7%):" with significant spacing
    /(?:ภาษี)\s*(?:\(๗%\))\s*:\s{10,}([0-9,]+\.?\d*)/gi, // "ภาษี (๗%):" with significant spacing
    
    // Short VAT patterns with colon - high confidence
    /(?:ภาษี)\s*(?:\(7%\))\s*:\s*([0-9,]+\.?\d*)/gi, // "ภาษี (7%): amount"
    /(?:ภาษี)\s*(?:\(๗%\))\s*:\s*([0-9,]+\.?\d*)/gi, // "ภาษี (๗%): amount"
    /(?:ภาษี)\s*(?:\( 7% \))\s*:\s*([0-9,]+\.?\d*)/gi, // "ภาษี ( 7% ): amount"
    /(?:ภาษี)\s*(?:\( ๗% \))\s*:\s*([0-9,]+\.?\d*)/gi, // "ภาษี ( ๗% ): amount"
    /(?:ภาษี)\s*7%\s*:\s*([0-9,]+\.?\d*)/gi, // "ภาษี 7%: amount"
    /(?:ภาษี)\s*๗%\s*:\s*([0-9,]+\.?\d*)/gi, // "ภาษี ๗%: amount"
    
    // English VAT patterns with immediate following
    /(?:VAT|vat|Vat)\s*:?\s*([0-9,]+\.?\d*)/gi,
    /(?:VAT|vat|Vat)\s*(?:\(7%\))?\s*:?\s*([0-9,]+\.?\d*)/gi,
    /(?:VAT|vat|Vat)\s*(?:\(VAT7%\))?\s*:?\s*([0-9,]+\.?\d*)/gi,
    
    // VAT abbreviation patterns - high confidence
    /(?:VAT\s*Amt\.?)\s*([0-9,]+\.?\d*)\s*(?:THB)?\s*$/gim, // "VAT Amt." at end of line
    /(?:VAT\s*Amount)\s*([0-9,]+\.?\d*)\s*(?:THB)?\s*$/gim, // "VAT Amount" at end of line
    /(?:Vat\s*Amt\.?)\s*([0-9,]+\.?\d*)\s*(?:THB)?\s*$/gim, // "Vat Amt." at end of line
    /(?:vat\s*amt\.?)\s*([0-9,]+\.?\d*)\s*(?:THB)?\s*$/gim, // "vat amt." at end of line
    /(?:VAT\s*Amt\.?)\s{5,}([0-9,]+\.?\d*)/gi, // "VAT Amt." with significant spacing
    /(?:VAT\s*Amount)\s{5,}([0-9,]+\.?\d*)/gi, // "VAT Amount" with significant spacing
    /(?:VAT\s*Amt\.?)\s*:?\s*([0-9,]+\.?\d*)/gi, // "VAT Amt." with optional colon
    /(?:VAT\s*Amount)\s*:?\s*([0-9,]+\.?\d*)/gi, // "VAT Amount" with optional colon
    /(?:Vat\s*Amt\.?)\s*:?\s*([0-9,]+\.?\d*)/gi, // "Vat Amt." with optional colon
    /(?:vat\s*amt\.?)\s*:?\s*([0-9,]+\.?\d*)/gi, // "vat amt." with optional colon
    
    // Thai VAT patterns - with colon (more specific)
    /(?:จำนวนภาษีมูลค่าเพิ่ม)\s*:\s*([0-9,]+\.?\d*)/gi,
    /(?:ภาษีมูลค่าเพิ่ม)\s*:\s*([0-9,]+\.?\d*)/gi,
    /(?:ภาษีมูลค่าเพิ่มรวม)\s*:\s*([0-9,]+\.?\d*)/gi,
    /(?:ภาษีมูลค่าเพิ่มทั้งหมด)\s*:\s*([0-9,]+\.?\d*)/gi,
    
    // Thai VAT patterns - with percentage indication
    /(?:ภาษีมูลค่าเพิ่ม)\s*(?:\(vat\))\s*:?\s*([0-9,]+\.?\d*)/gi,
    /(?:ภาษีมูลค่าเพิ่ม)\s*(?:\(7%\))\s*:?\s*([0-9,]+\.?\d*)/gi,
    /(?:ภาษีมูลค่าเพิ่ม)\s*(?:\(vat7%\))\s*:?\s*([0-9,]+\.?\d*)/gi,
    /(?:ภาษีมูลค่าเพิ่ม)\s*(?:\(VAT\))\s*:?\s*([0-9,]+\.?\d*)/gi,
    /(?:ภาษีมูลค่าเพิ่ม)\s*(?:\(VAT7%\))\s*:?\s*([0-9,]+\.?\d*)/gi,
    
    // Additional Thai VAT patterns
    /(?:ภาษีมูลค่าเพิ่ม)\s*(?:7%)\s*:?\s*([0-9,]+\.?\d*)/gi,
    /(?:ภาษีมูลค่าเพิ่ม)\s*(?:๗%)\s*:?\s*([0-9,]+\.?\d*)/gi,
    /(?:ภาษี)\s*(?:มูลค่าเพิ่ม)\s*:?\s*([0-9,]+\.?\d*)/gi,
    /(?:ม\.ค\.)\s*:?\s*([0-9,]+\.?\d*)/gi, // Common abbreviation for ภาษีมูลค่าเพิ่ม
    
    // VAT with Thai numbers
    /(?:ภาษีมูลค่าเพิ่ม)\s*(?:เจ็ดเปอร์เซ็นต์)\s*:?\s*([0-9,]+\.?\d*)/gi,
    
    // Mixed language patterns
    /(?:ภาษีมูลค่าเพิ่ม)\s*(?:VAT)\s*:?\s*([0-9,]+\.?\d*)/gi,
    /(?:VAT)\s*(?:ภาษีมูลค่าเพิ่ม)\s*:?\s*([0-9,]+\.?\d*)/gi,
    
    // Common variations with spaces and formatting
    /(?:ภาษี\s*มูลค่า\s*เพิ่ม)\s*:?\s*([0-9,]+\.?\d*)/gi,
    
    // Format with currency symbols
    /(?:VAT|vat|ภาษีมูลค่าเพิ่ม)\s*:?\s*฿\s*([0-9,]+\.?\d*)/gi,
    
    // Additional English VAT abbreviations and variations
    /(?:VAT\s*Total)\s*:?\s*([0-9,]+\.?\d*)/gi, // "VAT Total"
    /(?:Total\s*VAT)\s*:?\s*([0-9,]+\.?\d*)/gi, // "Total VAT"
    /(?:VAT\s*Tax)\s*:?\s*([0-9,]+\.?\d*)/gi, // "VAT Tax"
    /(?:Tax\s*VAT)\s*:?\s*([0-9,]+\.?\d*)/gi, // "Tax VAT"
    /(?:VAT\s*Charge)\s*:?\s*([0-9,]+\.?\d*)/gi, // "VAT Charge"
    /(?:VAT\s*Fee)\s*:?\s*([0-9,]+\.?\d*)/gi, // "VAT Fee"
    
    // Handle spacing variations for VAT Amt.
    /(?:VAT)\s+(?:Amt\.?)\s*([0-9,]+\.?\d*)/gi, // "VAT Amt." with space
    /(?:VAT)(?:Amt\.?)\s*([0-9,]+\.?\d*)/gi, // "VATAmt." without space
    
    // Case variations
    /(?:VAT\s*AMT\.?)\s*:?\s*([0-9,]+\.?\d*)/gi, // "VAT AMT."
    /(?:Vat\s*Amount)\s*:?\s*([0-9,]+\.?\d*)/gi, // "Vat Amount"
    
    // Additional pattern for 7% indication variations
    /(?:ภาษีมูลค่าเพิ่ม)\s*(?:\(7 %\))\s*:?\s*([0-9,]+\.?\d*)/gi,
    /(?:ภาษีมูลค่าเพิ่ม)\s*(?:\( 7% \))\s*:?\s*([0-9,]+\.?\d*)/gi,
    
    // LESS SPECIFIC PATTERNS (lower priority) - only if no specific matches found
    /(?:จำนวนภาษีมูลค่าเพิ่ม)\s*([0-9,]+\.?\d*)/gi,
    /(?:ภาษีมูลค่าเพิ่ม)\s*([0-9,]+\.?\d*)/gi,
    /(?:ภาษีมูลค่าเพิ่มรวม)\s*([0-9,]+\.?\d*)/gi,
    /(?:ภาษีมูลค่าเพิ่มทั้งหมด)\s*([0-9,]+\.?\d*)/gi,
    
    // Generic "ภาษี" patterns (lowest priority) - should catch "ภาษี (7%): 27.65 THB"
    /(?:ภาษี)\s*(?:\([0-9๗]+%\))?\s*:?\s*([0-9,]+\.?\d*)/gi // Generic tax with optional percentage
  ];

  const vatAmountsFound: string[] = [];
  const detectedVatAmounts: string[] = [];
  let vatAmountFound = false;
  
  // Process patterns with priority - stop after finding high-confidence matches
  let highConfidenceFound = false;
  
  for (let i = 0; i < vatAmountPatterns.length; i++) {
    const pattern = vatAmountPatterns[i];
    const matches = cleanText.matchAll(pattern);
    let foundInThisPattern = false;
    
    for (const match of matches) {
      if (match && match[1]) {
        const vatAmountStr = match[1].replace(/,/g, '').trim();
        const vatAmount = parseFloat(vatAmountStr);
        
        if (!isNaN(vatAmount) && vatAmount >= 0) {
          const formattedVatAmount = vatAmount.toString();
          const fullMatch = match[0];
          
          // Determine confidence level based on pattern index and characteristics
          const isHighConfidence = i < 5 || // First 5 patterns are high confidence
            fullMatch.includes(':') || // Has colon separator
            /\s{10,}/.test(fullMatch) || // Has significant spacing (receipt formatting)
            /\$$/.test(fullMatch); // At end of line
          
          // Additional validation to avoid false positives
          const isValidVatAmount = (amount: number, matchText: string): boolean => {
            // Skip if amount is too large (likely total amount, not VAT)
            if (amount > 10000) return false;
            
            // Skip if the match context suggests it's not VAT
            const beforeMatch = cleanText.substring(match.index! - 50, match.index!);
            const afterMatch = cleanText.substring(match.index! + matchText.length, match.index! + matchText.length + 50);
            
            // Check for context that suggests this is NOT a VAT amount
            const nonVatIndicators = [
              /ราคา.*ภาษีมูลค่าเพิ่ม/i,  // "ราคาภาษีมูลค่าเพิ่ม" (price including VAT)
              /รวมภาษีมูลค่าเพิ่ม/i,    // "รวมภาษีมูลค่าเพิ่ม" (total including VAT)
              /ก่อนภาษีมูลค่าเพิ่ม/i,    // "ก่อนภาษีมูลค่าเพิ่ม" (before VAT)
              /ก่อนภาษี/i,               // "ยอดรวมก่อนภาษี" (subtotal before tax)
              /สินค้า.*ภาษีมูลค่าเพิ่ม/i  // Product with VAT context
            ];
            
            if (nonVatIndicators.some(indicator => 
              indicator.test(beforeMatch + matchText + afterMatch))) {
              return false;
            }
            
            return true;
          };
          
          if (isValidVatAmount(vatAmount, fullMatch)) {
            // Avoid duplicates
            if (!vatAmountsFound.includes(formattedVatAmount)) {
              vatAmountFound = true;
              vatAmountsFound.push(formattedVatAmount);
              detectedVatAmounts.push(formattedVatAmount);
              foundInThisPattern = true;
              
              console.log(`🔍 VAT AMOUNT DETECTED: ${vatAmount} (${match[1]}) from pattern ${i+1}: ${pattern.source.substring(0, 50)}... [${isHighConfidence ? 'HIGH' : 'LOW'} confidence]`);
              
              if (isHighConfidence) {
                highConfidenceFound = true;
              }
            }
          } else {
            console.log(`⚠️ VAT AMOUNT FILTERED OUT: ${vatAmount} (${match[1]}) - failed validation`);
          }
        }
      }
    }
    
    pattern.lastIndex = 0; // Reset regex state
    
    // Stop processing low-confidence patterns once a high-confidence VAT was found
    if (highConfidenceFound && i >= 4) {
      console.log(`🎯 Stopping VAT detection - high-confidence match already found`);
      break;
    }
  }

  // If no VAT found by patterns
  if (!vatAmountFound) {
    console.log('❌ VAT AMOUNT NOT DETECTED');
  } else {
    console.log(`✅ VAT AMOUNTS FOUND: ${vatAmountsFound.length} amounts`);
    vatAmountsFound.forEach((vatAmount, index) => {
      console.log(`   ${index + 1}. ${vatAmount}`);
    });
  }

  // 6. Detect Date
  // Support numeric dates (dd/mm/yyyy) and Thai long-form dates like 'วันที่ 22 กันยายน 2568'
  const datePatterns = [
    // Thai long form day month year (allow abbreviated month tokens with dots, e.g. 'ส.ค.' or full names)
    /(?:วันที่)\s*(\d{1,2})\s*([ก-\u0E7Fa-zA-Z.]{1,10})\s*(\d{4})/gi,
    /(?:วันที่|Date|date)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/gi,
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\b/g
  ];

  let dateFound = false;
  for (const pattern of datePatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      if (!match) continue;
      // If Thai long-form (day, month name, year) was captured
      if (match[1] && match[2] && match[3]) {
        // Normalize month token by removing stray dots that appear in abbreviations (e.g., 'ส.ค.' -> 'สค')
        const rawMonth = match[2] || '';
        const normalizedMonth = rawMonth.replace(/\./g, '').trim();
        const dateStr = `${match[1]} ${normalizedMonth} ${match[3]}`;
        dateFound = true;
        detectedDates.push(dateStr); // Collect actual date string (Thai form)
        console.log(`🔍 DATE DETECTED (Thai long form): ${dateStr}`);
        break;
      }

      // Otherwise fallback to numeric group
      if (match[1]) {
        const dateStr = match[1];
        if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(dateStr)) {
          dateFound = true;
          detectedDates.push(dateStr); // Collect actual date
          console.log(`🔍 DATE DETECTED: ${dateStr}`);
          break;
        }
      }
    }
    if (dateFound) break;
  }

  if (!dateFound) {
    console.log('❌ DATE NOT DETECTED');
  }

  // 5. Detect Address Keywords
  // Using imported keywords from ocrKeywords.ts

  let addressFound = false;
  let provinceFound = '';
  
  // First check if at least one Thai province is found
  for (const province of thaiProvinces) {
    if (cleanText.toLowerCase().includes(province.toLowerCase())) {
      addressFound = true;
      provinceFound = province;
      detectedProvinces.push(province); // Collect actual province
      console.log(`🔍 ADDRESS DETECTED: Found Thai province "${province}"`);
      break;
    }
  }

  // If no province found, check for Bangkok-specific patterns
  if (!addressFound) {
    const bangkokPatterns = [
      /กรุงเทพ/,
      /บางกอก/,
      /Bangkok/i,
      /กทม/,
      /เขต\s*[ก-ฮ]+/,     // เขต + district name
      /แขวง\s*[ก-ฮ]+/,    // แขวง + subdistrict name
      /ราชเทว[ีิ]/,       // Common Bangkok area
      /สีลม/,
      /สุขุมวิท/,
      /พระโขนง/,
      /บางนา/,
      /ลาดพร้าว/,
      /จตุจักร/,
      /ปทุมวัน/,
    ];

    for (const pattern of bangkokPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        addressFound = true;
        provinceFound = 'กรุงเทพมหานคร (inferred)';
        detectedProvinces.push('กรุงเทพมหานคร'); // Collect Bangkok as province
        detectedAddresses.push(match[0]); // Collect the matched Bangkok pattern
        console.log(`🔍 ADDRESS DETECTED: Found Bangkok pattern "${pattern.source}"`);
        break;
      }
    }
  }

  // If still no address, check for general address indicators with numbers/postal codes
  if (!addressFound) {
    const addressPatterns = [
      /\d+\/\d+/,                                    // House number patterns like "123/45"
      /เลขที่\s*\d+/,                                // เลขที่ 123
      /ถนน[ก-ฮ\s]{1,30}/,                            // ถนน + street name (with spaces)
      /ถนน[ก-ฮ]{3,30}/,                              // ถนน + street name (no spaces)  
      /ซอย[ก-ฮ\s\d]{1,50}/,                         // ซอย + soi name (with spaces)
      /ซอย[ก-ฮ\d]{3,50}/,                           // ซอย + soi name (no spaces)
      /แขวง[ก-ฮ\s]{1,30}/,                          // แขวง + subdistrict (with spaces)
      /แขวง[ก-ฮ]{3,30}/,                            // แขวง + subdistrict (no spaces)
      /เขต[ก-ฮ\s]{1,30}/,                           // เขต + district (with spaces)
      /เขต[ก-ฮ]{3,30}/,                             // เขต + district (no spaces)
      /\d{5}/,                                       // 5-digit postal code
      /อำเภอ[ก-ฮ\s]{1,30}/,                         // อำเภอ + district
      /อำเภอ[ก-ฮ]{3,30}/,                           // อำเภอ + district (no spaces)
      /ตำบล[ก-ฮ\s]{1,30}/,                          // ตำบล + subdistrict
      /ตำบล[ก-ฮ]{3,30}/,                            // ตำบล + subdistrict (no spaces)
    ];

    for (const pattern of addressPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        // Additional check: ensure it's not filtered out as a name
        const matchText = match[0];
        if (matchText) {
          addressFound = true;
          provinceFound = 'Address pattern detected';
          detectedAddresses.push(matchText); // Collect the actual address pattern
          console.log(`🔍 ADDRESS DETECTED: Found address pattern "${pattern.source}" - "${matchText}"`);
          break;
        }
      }
    }
  }

  // Enhanced: Extract full address lines from text
  const fullAddressLines = extractFullAddressLines(cleanText);
  if (fullAddressLines.length > 0) {
    addressFound = true;
    // Prefer full address lines over smaller fragments: replace any previously collected
    // address fragments with the high-confidence full address lines so only the
    // complete addresses are returned to the frontend.
    detectedAddresses.length = 0;
    fullAddressLines.forEach(addressLine => {
      detectedAddresses.push(addressLine);
      console.log(`🏠 FULL ADDRESS EXTRACTED: "${addressLine}"`);
    });
  }

  if (!addressFound) {
    console.log('❌ ADDRESS NOT DETECTED: No Thai province or address pattern found');
    console.log('🔍 Looking for address indicators in text...');
    // Show some sample text to help debug
    const addressSample = cleanText.match(/.{0,30}(เลขที่|ถนน|ซอย|\d+\/\d+).{0,30}/g);
    if (addressSample) {
      console.log('📍 Found potential address text:', addressSample.slice(0, 3));
    }
  }

  // 6. Detect Receipt/Invoice Title
  // Using imported keywords from ocrKeywords.ts

  // Add fuzzy matching patterns for common OCR errors
  const receiptTitlePatterns = [
    // Exact matches
    /ใบเสร็จ/,
    /ใบเสร็จรับเงิน/,
    /ใบกำกับภาษี/,
    /บิลเงินสด/,
    /ใบรับรองแทนใบเสร็จรับเงิน/,
    /ใบสำคัญจ่าย/,
    /ใบสำคัญรับเงิน/,
    /บิลเงินสด/,
    /ใบรับเงิน/,
   
    
    // Fuzzy patterns for common OCR errors
    /ใบ[แเ][สศ]ร[็ะ]จ/,                    // ใบเสร็จ with character variations
    /ใบ[แเ][สศ]ร[็ะ]จรับเงิ[นิ]/,          // ใบเสร็จรับเงิน with variations
    /ใบ[แเ][สศ]ร[็ะ]จรับเงิ[นิ]?$/,        // ใบเสร็จรับเงิน at end of line
  /ใบกำก?ั?บ[\s\-\u200B\u200C\u200D]*ภาษ[ีีษศ]/, // permissive for ใบกํากับภาษี variations and zero-width chars
  /ใบก[ำ|ั]?ก[ั|า]?บ[\s\-\u200B\u200C\u200D]*ภาษ[ีีษศ]/, // more permissive broken-up pattern
    /ใบแสร็จ/,                             // Common OCR error: แสร็จ instead of เสร็จ
    /ใบแสร็จรับเงิ/,                        // Full common OCR error
  /กํากับภาษี|กํากับ|ก่ากับภาษี|กํกับภาษี/, // extra variants with possible combining char issues
    /ก[ำ|ั]?ก[ั|า]?บ[\s\-\u200B\u200C\u200D]*ภาษ[ีีษศ]/, // กํากับภาษี broken-up pattern    
    /ใบ[แเ][สศ]ร[็ะ]จ\s*\/\s*ใบกำก?ั?บ[\s\-\u200B\u200C\u200D]*ภาษ[ีีษศ]/, // combined variant with a slash between the two    
    // Add fuzzy Thai patterns for severely garbled OCR outputs (user-requested)
    /เบเสรจรบเงบน/,                         // fuzzy garbled form of ใบเสร็จรับเงิน
    /เบกากบภาษ/,                            // fuzzy garbled form of ใบกำกับภาษี
    /เบเสรจรบเงบน\s*\/\s*เบกากบภาษ/,    // combined variant with a slash between the two
  // Additional Thai title tokens (invoice / tax / delivery) and combined forms
  /ใบแจ้งหนี้/,                              // ใบแจ้งหนี้
  /ใบค[่ิ]?ม?า?ก?ั?บ[\s\-\u200B\u200C\u200D]*ภาษ[ีีษศ]/, // permissive for ใบคํากับภาษี variations
  /ใบส่งของ/,                                 // ใบส่งของ
  /ใบแจ้งหนี้\s*\/\s*ใบค[\s\S]{0,20}ภาษ[ีีษศ]/, // combined Thai slash variant (tolerant)
  /ใบแจ้งหนี้\s*\/\s*ใบค[\s\S]{0,20}ภาษ[ีีษศ]\s*\/\s*ใบส่งของ/, // triple combined Thai (slash-separated)
  // Sequence-aware fuzzy match: allow up to 40 chars between the tokens to tolerate OCR noise/spacing
  /ใบแจ้งหนี้[\s\S]{0,40}ใบค[\s\S]{0,20}ภาษ[\s\S]{0,20}[\s\S]{0,40}ใบส่งของ/, 
  // English/Latin variants and common OCR typos for invoice/tax/delivery
  /Invoice/i,
  /Involce/i, // common OCR typo for Invoice
  /Invoice\s*\/\s*Tax/i,
  /Involce\s*\/\s*Tax/i,
  /Invoice\s*\/\s*Tax\s*\/\s*Delivery/i,
  /Involce\s*\/\s*Tax\s*\/\s*Delivery/i,
    /บ[ีี]ลเงินสด/,                           // บิลเงินสด with character variations    
    /ใบร[ัา]บรองแทนใบแสร็จรบเงบน/,         // fuzzy garbled form of ใบรับรองแทนใบเสร็จรับเงิน
    /ใบสำคัญจ่าย/,                          // ใบสำคัญจ่าย
    /ใบสำคัญรับเงิ[นิ]/,                    // ใบสำคัญรับเงิน with variations
    /ใบสำคัญรับเงิ[นิ]?$/,                  // ใบสำคัญรับเงิน at end of line
    /บิลเงินสด/,                            // บิลเงินสด
    /ใบร[ัา]บเงิ[นิ]/,                      // ใบรับเงิน with variations
    /ใบร[ัา]บเงิ[นิ]?$/                     // ใบรับเงิน at end of line

  ];

  let receiptTitleFound = false;
  let foundTitle = '';
  
  // First try exact matches
  for (const title of receiptTitleKeywords) {
    if (cleanText.includes(title)) {
      receiptTitleFound = true;
      foundTitle = title;
      console.log(`🔍 RECEIPT TITLE DETECTED (exact): Found "${title}"`);
      break;
    }
  }

  // If no exact match, try fuzzy patterns
  if (!receiptTitleFound) {
    for (const pattern of receiptTitlePatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        receiptTitleFound = true;
        foundTitle = match[0];
        console.log(`🔍 RECEIPT TITLE DETECTED (fuzzy): Found "${match[0]}" (pattern match)`);
        break;
      }
    }
  }

  if (!receiptTitleFound) {
    console.log('❌ RECEIPT TITLE NOT DETECTED: No valid receipt/invoice title found');
    console.log('🔍 Text sample for debugging:', cleanText.substring(0, 200) + '...');
  }

  // Summary
  const summary = {
    hasAtLeast2Names: namesFound.length >= 2,
    hasAtLeast1TaxId: taxIdsFound.length >= 1,
    hasTaxInvoiceId: taxInvoiceIdsFound.length >= 1,
    hasVatAmount: vatAmountFound,
    hasAmount: amountFound,
    hasDate: dateFound,
    hasAddress: addressFound,
    hasReceiptTitle: receiptTitleFound
  };

  console.log('\n📊 DETECTION SUMMARY:');
  console.log(`✅ Names: ${namesFound.length >= 2 ? 'PASS' : 'FAIL'} (Found ${namesFound.length}, need ≥2)`);
  console.log(`✅ Tax IDs: ${taxIdsFound.length >= 1 ? 'PASS' : 'FAIL'} (Found ${taxIdsFound.length}, need ≥1)`);
  console.log(`✅ Tax Invoice IDs: ${taxInvoiceIdsFound.length >= 1 ? 'PASS' : 'FAIL'} (Found ${taxInvoiceIdsFound.length})`);
  console.log(`✅ VAT Amount: ${vatAmountFound ? 'PASS' : 'FAIL'} (Found ${vatAmountsFound.length})`);
  console.log(`✅ Amount: ${amountFound ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Date: ${dateFound ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Address: ${addressFound ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Receipt Title: ${receiptTitleFound ? 'PASS' : 'FAIL'}`);

  // Filter out zero VAT amounts (common OCR false positives like "0")
  const filterNonZero = (arr: string[]) => arr.filter(v => {
    if (!v && v !== '0') return false;
    const num = parseFloat(v.toString().replace(/,/g, '').trim());
    return !isNaN(num) && Math.abs(num) > 0;
  });

  const vatAmountsFoundFiltered = filterNonZero(vatAmountsFound);
  const detectedVatAmountsFiltered = filterNonZero(detectedVatAmounts);

  // --- Override with Thai ID card specific extraction ---
  if (isThaiIdCard) {
    const idCardData = extractThaiIdCardData(text);
    if (idCardData.name) {
      namesFound.length = 0;
      namesFound.push(idCardData.name);
      console.log(`🪪 ID card name override: "${idCardData.name}"`);
    }
    if (idCardData.idNumber) {
      taxIdsFound.length = 0;
      taxIdsFound.push(idCardData.idNumber);
      console.log(`🪪 ID card number override: "${idCardData.idNumber}"`);
    }
    if (idCardData.address) {
      detectedAddresses.length = 0;
      detectedAddresses.push(idCardData.address);
      console.log(`🪪 ID card address override: "${idCardData.address}"`);
    }
    summary.hasAtLeast2Names = false; // ID card has 1 person, not 2 parties
    summary.hasAtLeast1TaxId = taxIdsFound.length >= 1;
    summary.hasReceiptTitle = false;
  }

  return {
    namesFound,
    taxIdsFound,
  taxInvoiceIdsFound,
    amountFound,
    dateFound,
    addressFound,
    receiptTitleFound,
    vatAmountFound,
    isThaiIdCard,
    // Return the actual collected values instead of placeholder text
    amountsDetected: detectedAmounts,
    datesDetected: detectedDates,
  addressesDetected: detectedAddresses,
  provincesDetected: detectedProvinces,
    taxInvoiceIdsDetected: detectedTaxInvoiceIds,
  // Return VAT arrays excluding zero values
  vatAmountsFound: vatAmountsFoundFiltered,
  vatAmountsDetected: detectedVatAmountsFiltered,
    summary
  };
};

// Keep the old validation function for backward compatibility
export const validateExtractedData = (data: OCRResult): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate sName
  if (data.sName) {
    // Condition 1: Names that start with company prefixes and end with จำกัด/จํากัด or จำกัด มหาชน/จํากัด มหาชน
    const condition1Pattern = /^(?:ห้างหุ้นส่วนจำกัด|ห้างหุ้นส่วนจํากัด|บจก\.?|บมจ\.?).*(?:จำกัด\s*มหาชน|จํากัด\s*มหาชน|จำกัด|จํากัด)$/i;
    // Condition 2: Names that start with personal/company titles (with optional space)
    const condition2Pattern = /^(?:นาง|นาย|นางสาว|นส\.?|คุณ)\s?/i;
    // Condition 3: Names that start with "บริษัท" and end with จำกัด/จํากัด
    const condition3Pattern = /^บริษัท\s+.*(?:จำกัด\s*มหาชน|จํากัด\s*มหาชน|จำกัด|จํากัด)$/i;
    // Condition 4: Names that start with "ชื่อบริษัทลูกค้า:" , "ลูกค้า:"
     const condition4Pattern = /^(?:ชื่อบริษัทลูกค้า:|ลูกค้า:)\s*บริษัท\s+.*(?:จำกัด\s*มหาชน|จํากัด\s*มหาชน|จำกัด|จํากัด)$/i;

    if (!condition1Pattern.test(data.sName) && !condition2Pattern.test(data.sName) && !condition3Pattern.test(data.sName) && !condition4Pattern.test(data.sName)) {
      errors.push('sName must either: 1) Start with ห้างหุ้นส่วนจำกัด/บจก/บมจ and end with จำกัด, or 2) Start with นาง/นาย/นางสาว/นส/คุณ, or 3) Start with บริษัท and end with จำกัด, or 4) Start with ชื่อบริษัทลูกค้า: or ลูกค้า:');
    }
  }

  // Validate sAddress
  if (data.sAddress) {
    const addressKeywords = ['บ้านเลขที่', 'เลขที่', 'หมู่บ้าน', 'หมู่', 'จังหวัด', 'จ.', 'อำเภอ', 'อ.', 'ตำบล', 'ต.', 'ซอย', 'แขวง', 'เขต','ถนน','ถ.'];
    const postalCodePattern = /\d{5}/;
    
    const hasAddressKeywords = addressKeywords.some(keyword => 
      data.sAddress!.toLowerCase().includes(keyword.toLowerCase())
    );
    const hasPostalCode = postalCodePattern.test(data.sAddress);

    if (!hasAddressKeywords) {
      errors.push('sAddress must contain address keywords (บ้านเลขที่, หมู่, อำเภอ, ตำบล, จังหวัด, etc.)');
    }
    if (!hasPostalCode) {
      errors.push('sAddress must contain 5-digit postal code');
    }
  }

  // Validate sTaxId
  if (data.sTaxId) {
    const taxIdPattern = /^\d{13}$/;
    if (!taxIdPattern.test(data.sTaxId)) {
      errors.push('sTaxId must be exactly 13 digits');
    }
  }

  // Validate amount
  if (data.amount) {
    if (typeof data.amount !== 'number' || data.amount <= 0) {
      errors.push('Amount must be a positive number');
    }
  }

  // Validate date
  if (data.date) {
    const datePattern = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/;
    if (!datePattern.test(data.date)) {
      errors.push('Date must be in DD/MM/YYYY or DD-MM-YYYY format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Lightweight OCR — returns raw text only (no structured detection).
 * Used for bill customer info extraction: image is processed in memory and never saved.
 */
export const extractRawTextFromImage = async (imageBuffer: Buffer): Promise<string> => {
  let jpegBuffer: Buffer | null = null;
  try {
    jpegBuffer = await sharp(imageBuffer).jpeg().toBuffer();
  } catch {
    // Format not supported by sharp (e.g. HEIC) — fall back to EasyOCR
    console.log('⚠️ sharp cannot decode format — routing to EasyOCR');
  }

  if (!jpegBuffer) {
    return runEasyOCR(imageBuffer);
  }

  const worker = await getThaiEngWorker();
  const { data: { text } } = await worker.recognize(jpegBuffer);

  // If Tesseract produced low-quality output, try EasyOCR
  const meaningfulChars = (text.match(/[\u0E00-\u0E7Fa-zA-Z0-9]/g) ?? []).length;
  if (meaningfulChars < 10) {
    console.log(`⚠️ Tesseract low-quality output (${meaningfulChars} chars) — falling back to EasyOCR`);
    return runEasyOCR(imageBuffer);
  }

  return text;
};
