import { taxType } from "../generated/client1";

// Thai juristic person keywords
export const thaiJuristicKeywords = [
  "บริษัท", // Company
  "ห้างหุ้นส่วน", // Partnership
  "ห้างหุ้นส่วนจำกัด", // Limited Partnership
  "จำกัด", // Limited
  "จํากัด", // Limited (alternative spelling)
  "มหาชน", // Public
  "สหกรณ์", // Cooperative
  "มูลนิธิ", // Foundation
  "องค์การ", // Organization
  "สมาคม", // Association
  "สถาบัน", // Institute
  "โรงเรียน", // School
  "วิทยาลัย", // College
  "มหาวิทยาลัย", // University
  "โรงพยาบาล", // Hospital
  "คลินิก", // Clinic
  "ธนาคาร", // Bank
  "สำนักงาน", // Office
  "ร้าน", // Shop/Store
  "ศูนย์", // Center
  "เซ็นเตอร์", // Center (English loanword)
  "กรุ๊ป", // Group
  "กลุ่ม", // Group
  "หจก.", // Limited Partnership abbreviation
  "บจก.", // Limited Company abbreviation
  "บมจ.", // Public Limited Company abbreviation
];

// English juristic person keywords
export const englishJuristicKeywords = [
  "company",
  "corp",
  "corporation",
  "inc",
  "incorporated",
  "ltd",
  "limited",
  "llc",
  "partnership",
  "co.",
  "group",
  "enterprise",
  "enterprises",
  "business",
  "organization",
  "foundation",
  "institute",
  "association",
  "center",
  "centre",
  "hospital",
  "clinic",
  "bank",
  "office",
  "shop",
  "store",
  "market",
  "mall",
  "plaza",
  "hotel",
  "resort",
  "restaurant",
  "cafe",
  "service",
  "services",
  "solutions",
  "technology",
  "tech",
  "systems",
  "international",
  "global",
  "holdings",
  "industries",
  "manufacturing",
  "trading",
  "import",
  "export",
  "logistics",
  "transport",
  "consulting",
  "advisory",
  "management",
  "development",
  "construction",
  "engineering",
  "design",
  "studio",
  "agency",
  "media",
  "communications",
  "marketing",
  "advertising",
  "publishing",
  "printing",
  "retail",
  "wholesale",
  "distribution",
  "supply",
  "chain",
  "network",
  "platform",
  "digital",
  "online",
  "e-commerce",
  "software",
  "hardware",
  "innovation",
  "research",
  "laboratory",
  "lab",
  "pharmaceutical",
  "medical",
  "healthcare",
  "finance",
  "investment",
  "capital",
  "fund",
  "insurance",
  "property",
  "real estate",
  "realestate",
  "entertainment",
  "gaming",
  "sports",
  "fitness",
  "wellness",
  "beauty",
  "fashion",
  "textile",
  "garment",
  "food",
  "beverage",
  "catering",
  "agriculture",
  "farm",
  "farming",
  "marine",
  "shipping",
  "freight",
  "cargo",
  "aviation",
  "airline",
  "travel",
  "tour",
  "tourism",
  "vacation",
  "education",
  "training",
  "academy",
  "school",
  "university",
  "college",
];

// Combined keywords for easy access
export const allJuristicKeywords = [
  ...thaiJuristicKeywords,
  ...englishJuristicKeywords,
];

// Function to auto-detect tax type based on supplier name
export const autoDetectTaxType = (sName: string): taxType => {
  if (!sName || sName.trim() === "") {
    console.log(`🔍 AutoDetect: Empty sName, returning Individual`);
    return taxType.Individual;
  }

  const name = sName.toLowerCase().trim();
  console.log(`🔍 AutoDetect: Processing name: "${sName}" -> normalized: "${name}"`);

  // Check for Thai keywords
  for (const keyword of thaiJuristicKeywords) {
    const keywordLower = keyword.toLowerCase();
    if (name.includes(keywordLower)) {
      console.log(
        `🏢 AutoDetect: Found Thai juristic keyword: "${keyword}" (normalized: "${keywordLower}") in "${sName}"`
      );
      return taxType.Juristic;
    }
  }

  // Check for English keywords
  for (const keyword of englishJuristicKeywords) {
    const keywordLower = keyword.toLowerCase();
    if (name.includes(keywordLower)) {
      console.log(
        `🏢 AutoDetect: Found English juristic keyword: "${keyword}" (normalized: "${keywordLower}") in "${sName}"`
      );
      return taxType.Juristic;
    }
  }

  // Default to Individual if no juristic indicators found
  console.log(`👤 AutoDetect: No juristic keywords found in "${sName}", returning Individual`);
  return taxType.Individual;
};

// Thai provinces for address detection
export const thaiProvinces = [
  "กรุงเทพมหานคร",
  "กระบี่",
  "กาญจนบุรี",
  "กาฬสินธุ์",
  "กำแพงเพชร",
  "ขอนแก่น",
  "จันทบุรี",
  "ฉะเชิงเทรา",
  "ชลบุรี",
  "ชัยนาท",
  "ชัยภูมิ",
  "ชุมพร",
  "เชียงราย",
  "เชียงใหม่",
  "ตรัง",
  "ตราด",
  "ตาก",
  "นครนายก",
  "นครปฐม",
  "นครพนม",
  "นครราชสีมา",
  "นครศรีธรรมราช",
  "นครสวรรค์",
  "นนทบุรี",
  "นราธิวาส",
  "น่าน",
  "บึงกาฬ",
  "บุรีรัมย์",
  "ปทุมธานี",
  "ประจวบคีรีขันธ์",
  "ปราจีนบุรี",
  "ปัตตานี",
  "พระนครศรีอยุธยา",
  "พังงา",
  "พัทลุง",
  "พิจิตร",
  "พิษณุโลก",
  "เพชรบุรี",
  "เพชรบูรณ์",
  "แพร่",
  "ภูเก็ต",
  "มหาสารคาม",
  "มุกดาหาร",
  "แม่ฮ่องสอน",
  "ยโสธร",
  "ยะลา",
  "ร้อยเอ็ด",
  "ระนอง",
  "ระยอง",
  "ราชบุรี",
  "ลพบุรี",
  "ลำปาง",
  "ลำพูน",
  "เลย",
  "ศรีสะเกษ",
  "สกลนคร",
  "สงขลา",
  "สตูล",
  "สมุทรปราการ",
  "สมุทรสงคราม",
  "สมุทรสาคร",
  "สระแก้ว",
  "สระบุรี",
  "สิงห์บุรี",
  "สุโขทัย",
  "สุพรรณบุรี",
  "สุราษฎร์ธานี",
  "สุรินทร์",
  "หนองคาย",
  "หนองบัวลำภู",
  "อ่างทอง",
  "อำนาจเจริญ",
  "อุดรธานี",
  "อุตรดิตถ์",
  "อุทัยธานี",
  "อุบลราชธานี",
  // Common abbreviations of provinces
  "กทม.",
  "กรุงเทพ",
  "กรุงเทพฯ",
  "นม.",
  "นบ.",
  "ปท.",
  "สป.",
  "สค.",
  "สส.",
];

// General address keywords for detection
export const generalAddressKeywords = [
  "อาคาร",
  "ชั้น",
  "ตึก",
  "อาคารพาณิชย์",
  "อาคารชุด",
  "ห้อง",
  "โรงเรียน",
  "โรงพยาบาล",
  "คลินิก",
  "มหาวิทยาลัย",
  "วิทยาลัย",  
  "ธนาคาร",
  "สำนักงาน",
  "ร้าน",
  "ศูนย์บริการ",
  "แขวง",
  "เขต",
  "อำเภอ",
  "ตำบล",
  "จังหวัด",
  "หมู่บ้าน",
  "หมู่",
  "ข.",
  "ต.",
  "จ.",
  "อ.",
  "บ้านเลขที่",
  "เลขที่",
  "ซอย",
  "ถนน",
  "ถ.",
  "รามอินทรา",
  "วิภาวดี",
  "พหลโยธิน",
  "งามวงศ์วาน",
  "บางนา",
  "สุขุมวิท",
  "เพชรบุรี",
  "ราชดำริ",
  "สีลม",
  "พระโขนง",
  "ลาดพร้าว",
  "จตุจักร",
  "ปทุมวัน",
  "บางกะปิ",
  "บางกอกน้อย",
  "บางกอกใหญ่",
  "คลองเตย",
];

// Receipt/Invoice title keywords
export const receiptTitleKeywords = [
  "ใบเสร็จ",
  "ใบเสร็จรับเงิน",
  "ใบกำกับภาษี",
  "ใบรับรองแทนใบเสร็จ",
  "ใบรับรองแทนใบเสร็จรับเงิน",
  "ใบรับเงิน",
  "ใบสำคัญรับเงิน",
  "ใบเสร็จรับเงิน/ใบกำกับภาษี",
  "บิลเงินสด",
  "invoice",
  "receipt",
  "tax invoice",
  "cash bill",
  "bill",
];

// Export all keywords for easy importing
export { taxType };
