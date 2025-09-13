import Tesseract from 'tesseract.js';
import sharp from 'sharp';

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
  amountFound: boolean;
  dateFound: boolean;
  addressFound: boolean;
  receiptTitleFound: boolean;
  // Add detailed detection results
  amountsDetected: string[];
  datesDetected: string[];
  addressesDetected: string[];
  provincesDetected: string[];
  summary: {
    hasAtLeast2Names: boolean;
    hasAtLeast1TaxId: boolean;
    hasAmount: boolean;
    hasDate: boolean;
    hasAddress: boolean;
    hasReceiptTitle: boolean;
  };
}

export interface OCRDetectionResult {
  namesFound: string[];
  taxIdsFound: string[];
  amountFound: boolean;
  dateFound: boolean;
  addressFound: boolean;
  receiptTitleFound: boolean;
  // Add detailed detection results
  amountsDetected: string[];
  datesDetected: string[];
  addressesDetected: string[];
  provincesDetected: string[];
  summary: {
    hasAtLeast2Names: boolean;
    hasAtLeast1TaxId: boolean;
    hasAmount: boolean;
    hasDate: boolean;
    hasAddress: boolean;
    hasReceiptTitle: boolean;
  };
}

export interface OCRResult extends ExtractedData {}

export const extractTextFromImage = async (imageBuffer: Buffer): Promise<OCRDetectionResult> => {
  try {
    console.log('🔍 Starting image preprocessing...');
    
    // Preprocess image for better OCR results
    const processedImage = await sharp(imageBuffer)
      .resize({ width: 1200, height: 1600, fit: 'inside' })
      .greyscale()
      .normalize()
      .sharpen()
      .toBuffer();

    console.log('🔍 Starting OCR processing...');

    // Perform OCR with Thai language support
    const { data: { text } } = await Tesseract.recognize(
      processedImage,
      'tha+eng', // Thai and English languages
      {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    console.log('🔍 Raw extracted text:', text);

    // Detect data presence from text
    const result = detectDataPresence(text);
    
    return result;
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      namesFound: [],
      taxIdsFound: [],
      amountFound: false,
      dateFound: false,
      addressFound: false,
      receiptTitleFound: false,
      amountsDetected: [],
      datesDetected: [],
      addressesDetected: [],
      provincesDetected: [],
      summary: {
        hasAtLeast2Names: false,
        hasAtLeast1TaxId: false,
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
export const detectDataPresence = (text: string): OCRDetectionResult => {
  // Clean up the text - remove extra whitespace and normalize
  const cleanText = text.replace(/\s+/g, ' ').trim();
  console.log('🔍 Starting data detection...');
  
  // Initialize arrays to collect actual detected values
  const detectedAmounts: string[] = [];
  const detectedDates: string[] = [];
  const detectedAddresses: string[] = [];
  const detectedProvinces: string[] = [];
  
  // 1. Detect Names
  const namePatterns = [
    // Company names with prefixes and endings
    /(?:ห้างหุ้นส่วนจำกัด|ห้างหุ้นส่วนจํากัด|บจก\.?|บมจ\.?)\s*([^.\n\r;,]*?)(?:จำกัด\s*มหาชน|จํากัด\s*มหาชน|จำกัด|จํากัด)/gi,
    // Personal names with titles
    /(?:จำกัด|จํากัด|นาง|นาย|นางสาว|นส\.?|คุณ)\s?([^\n\r.;,]+)/gi,
    // บริษัท pattern
    /บริษัท\s+([^.\n\r;,]*?)(?:จำกัด\s*มหาชน|จํากัด\s*มหาชน|จำกัด|จํากัด)/gi,
    // ชื่อบริษัท pattern
    /ชื่อบริษัท:\s*บริษัท\s+([^.\n\r;,]*?)(?:จำกัด\s*มหาชน|จํากัด\s*มหาชน|จำกัด|จํากัด)/gi,
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
          console.log(`🚫 Filtered out address detected as name: ${fullName}`);
        }
      }
    }
    pattern.lastIndex = 0;
  }

  console.log(`🔍 NAMES DETECTED: ${namesFound.length} names found`);
  namesFound.forEach((name, index) => {
    console.log(`   ${index + 1}. ${name}`);
  });

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

  // 3. Detect Amount
  const amountPatterns = [
    /(?:Total|ทั้งหมด|รวม|รวมทั้งหมด|ยอดรวม|จำนวนเงินทั้งสิ้น|จำนวนเงินรวม)\s*:?\s*([0-9,]+\.?\d*)/gi,
    /(?:Total|ทั้งหมด|รวม|รวมทั้งหมด|ยอดรวม|จำนวนเงินทั้งสิ้น|จำนวนเงินรวม)\s*:?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
    /(?:Total|TOTAL)\s*:?\s*฿?\s*([0-9,]+\.?\d*)/gi
  ];

  let amountFound = false;
  for (const pattern of amountPatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      if (match && match[1]) {
        const amountStr = match[1].replace(/,/g, '');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > 0) {
          amountFound = true;
          detectedAmounts.push(amount.toString()); // Collect actual amount
          console.log(`🔍 AMOUNT DETECTED: ${amount} (${match[1]})`);
          break;
        }
      }
    }
    if (amountFound) break;
  }

  if (!amountFound) {
    console.log('❌ AMOUNT NOT DETECTED');
  }

  // 4. Detect Date
  const datePatterns = [
    /(?:วันที่|Date|date)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/gi,
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\b/g
  ];

  let dateFound = false;
  for (const pattern of datePatterns) {
    const matches = cleanText.matchAll(pattern);
    for (const match of matches) {
      if (match && match[1]) {
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
  const generalAddressKeywords = [
    'แขวง', 'เขต', 'อำเภอ', 'ตำบล', 'จังหวัด', 'หมู่บ้าน', 'หมู่',
    'ข.', 'ต.', 'จ.', 'อ.', 'บ้านเลขที่', 'เลขที่', 'ซอย', 'ถนน', 'ถ.'
  ];

  const thaiProvinces = [
    // All 76 Thai provinces
    'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา',
    'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก',
    'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน',
    'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา',
    'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม',
    'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี',
    'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม',
    'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์',
    'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี',
    // Common abbreviations of provinces
    'กทม.', 'นม.', 'นบ.', 'ปท.', 'สป.', 'สค.', 'สส.'
  ];

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
      /ถนน[ก-ฮ\s]+/,                                  // ถนน + street name
      /ซอย[ก-ฮ\s\d]+/,                               // ซอย + soi name
      /\d{5}/,                                       // 5-digit postal code
      /อำเภอ[ก-ฮ\s]+/,                               // อำเภอ + district
      /ตำบล[ก-ฮ\s]+/,                                // ตำบล + subdistrict
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
  const receiptTitles = [
    'ใบเสร็จ',
    'ใบเสร็จรับเงิน',
    'ใบกำกับภาษี',
    'ใบเสร็จรับเงิน/ใบกำกับภาษี',
    'บิลเงินสด'
  ];

  // Add fuzzy matching patterns for common OCR errors
  const receiptTitlePatterns = [
    // Exact matches
    /ใบเสร็จ/,
    /ใบเสร็จรับเงิน/,
    /ใบกำกับภาษี/,
    /บิลเงินสด/,
    
    // Fuzzy patterns for common OCR errors
    /ใบ[แเ][สศ]ร[็ะ]จ/,                    // ใบเสร็จ with character variations
    /ใบ[แเ][สศ]ร[็ะ]จรับเงิ[นิ]/,          // ใบเสร็จรับเงิน with variations
    /ใบ[แเ][สศ]ร[็ะ]จรับเงิ[นิ]?$/,        // ใบเสร็จรับเงิน at end of line
    /ใบกำกับ[ภพ][าะ][ษศ][ีิ]/,              // ใบกำกับภาษี with variations
    /ใบแสร็จ/,                             // Common OCR error: แสร็จ instead of เสร็จ
    /ใบแสร็จรับเงิ/,                        // Full common OCR error
  ];

  let receiptTitleFound = false;
  let foundTitle = '';
  
  // First try exact matches
  for (const title of receiptTitles) {
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
    hasAmount: amountFound,
    hasDate: dateFound,
    hasAddress: addressFound,
    hasReceiptTitle: receiptTitleFound
  };

  console.log('\n📊 DETECTION SUMMARY:');
  console.log(`✅ Names: ${namesFound.length >= 2 ? 'PASS' : 'FAIL'} (Found ${namesFound.length}, need ≥2)`);
  console.log(`✅ Tax IDs: ${taxIdsFound.length >= 1 ? 'PASS' : 'FAIL'} (Found ${taxIdsFound.length}, need ≥1)`);
  console.log(`✅ Amount: ${amountFound ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Date: ${dateFound ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Address: ${addressFound ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Receipt Title: ${receiptTitleFound ? 'PASS' : 'FAIL'}`);

  return {
    namesFound,
    taxIdsFound,
    amountFound,
    dateFound,
    addressFound,
    receiptTitleFound,
    // Return the actual collected values instead of placeholder text
    amountsDetected: detectedAmounts,
    datesDetected: detectedDates,
    addressesDetected: detectedAddresses,
    provincesDetected: detectedProvinces,
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
