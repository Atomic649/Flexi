import Tesseract from 'tesseract.js';
import sharp from 'sharp';
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
  amountFound: boolean;
  dateFound: boolean;
  addressFound: boolean;
  receiptTitleFound: boolean;
  // Add detailed detection results
  amountsDetected: string[];
  datesDetected: string[];
  addressesDetected: string[];
  provincesDetected: string[];
  taxInvoiceIdsDetected: string[];
  summary: {
    hasAtLeast2Names: boolean;
    hasAtLeast1TaxId: boolean;
    hasTaxInvoiceId: boolean;
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
        }
      }
    }
  }
  
  console.log(`🔍 TOTAL ADDRESSES EXTRACTED: ${addresses.length}`);
  return addresses;
};

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
      taxInvoiceIdsFound: [],
      amountFound: false,
      dateFound: false,
      addressFound: false,
      receiptTitleFound: false,
      amountsDetected: [],
      datesDetected: [],
      addressesDetected: [],
      provincesDetected: [],
      taxInvoiceIdsDetected: [],
      summary: {
        hasAtLeast2Names: false,
        hasAtLeast1TaxId: false,
        hasTaxInvoiceId: false,
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
  const detectedTaxInvoiceIds: string[] = [];
  
  // 1. Detect Names
  const namePatterns = [
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
        
        // Clean up the invoice ID
        invoiceId = invoiceId.replace(/\s+/g, ' ').trim();
        
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
    fullAddressLines.forEach(addressLine => {
      if (!detectedAddresses.includes(addressLine)) {
        detectedAddresses.push(addressLine);
        console.log(`🏠 FULL ADDRESS EXTRACTED: "${addressLine}"`);
      }
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
    hasAmount: amountFound,
    hasDate: dateFound,
    hasAddress: addressFound,
    hasReceiptTitle: receiptTitleFound
  };

  console.log('\n📊 DETECTION SUMMARY:');
  console.log(`✅ Names: ${namesFound.length >= 2 ? 'PASS' : 'FAIL'} (Found ${namesFound.length}, need ≥2)`);
  console.log(`✅ Tax IDs: ${taxIdsFound.length >= 1 ? 'PASS' : 'FAIL'} (Found ${taxIdsFound.length}, need ≥1)`);
  console.log(`✅ Tax Invoice IDs: ${taxInvoiceIdsFound.length >= 1 ? 'PASS' : 'FAIL'} (Found ${taxInvoiceIdsFound.length})`);
  console.log(`✅ Amount: ${amountFound ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Date: ${dateFound ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Address: ${addressFound ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Receipt Title: ${receiptTitleFound ? 'PASS' : 'FAIL'}`);

  return {
    namesFound,
    taxIdsFound,
    taxInvoiceIdsFound,
    amountFound,
    dateFound,
    addressFound,
    receiptTitleFound,
    // Return the actual collected values instead of placeholder text
    amountsDetected: detectedAmounts,
    datesDetected: detectedDates,
    addressesDetected: detectedAddresses,
    provincesDetected: detectedProvinces,
    taxInvoiceIdsDetected: detectedTaxInvoiceIds,
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
