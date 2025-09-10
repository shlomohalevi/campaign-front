




// fileUtils.js
import * as XLSX from 'xlsx';

// Function to read a file and return its rows (for both CSV and Excel files)
export const readFileContent = async (file, fileExtension) => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = (event) => {
      let rows = [];

      try {
        if (fileExtension === 'csv') {
          const text = event.target.result;
          
          // Check if the file uses tab-separated values or comma-separated
          const delimiter = text.indexOf('\t') > text.indexOf(',') ? '\t' : ',';

          // Split by the detected delimiter
          rows = text.split('\n').map(row => row.split(delimiter));
        } else {
          const arrayBuffer = event.target.result;
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        }

        // Filter out empty rows
        rows = rows.filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''));

        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);

    // Determine file read type
    if (fileExtension === 'csv') {
      reader.readAsText(file);  // For CSV, read as text
    } else {
      reader.readAsArrayBuffer(file);  // For Excel files, read as ArrayBuffer
    }
  });
};




const hebrewToEnglishMapping = {
  'מזהה אנש': 'AnashIdentifier',
  'שם': 'FirstName',
  'משפחה': 'LastName',
  'כתובת': 'Address',
  'עיר': 'City',
  'מספר': 'AddressNumber',
  'מספר זהות': 'PersonID',
  'תז אב': 'FatherId',

  'שם האב': 'FatherName',
  'טל נייד': 'MobilePhone',
  'טל בית': 'HomePhone',
  'בית מדרש': 'BeitMidrash',
  'סיווג': 'Classification',
  'אופן התרמה': 'DonationMethod',
  'מתרים': 'fundRaiser',
  'למד בישיבה בשנים': 'StudiedInYeshivaYears',
  'שנה ישיג': 'yashagYear',
  'אחראי ועד': 'CommitteeResponsibility',
  'קבוצה למסיבה': 'PartyGroup',
  'שם מזמין למסיבה': 'PartyInviterName',
  'קומה': 'floor',
  'מיקוד': 'zipCode',
  'כניסה':'Entry',

  'נייד 1': 'MobilePhone',
  'נייד בבית 1': 'MobileHomePhone',
  'בית 1': 'HomePhone',
  'דוא"ל': 'Email',
  'מספר קבוצה': 'GroupNumber',
  'שדה חופשי': 'FreeFieldsToFillAlone',
  'שדה חופשי 2': 'AnotherFreeFieldToFillAlone',
  'הערות אלפון': 'PhoneNotes',
  'דרגה': 'Rank',






  'קיבל מתנה': 'ReceivedGift',
  "סכום התחייבות": "CommitmentAmount",
  "סכום שולם": "AmountPaid",
  "סכום שנותר": "AmountRemaining",
  "מספר תשלומים": "NumberOfPayments",
  "תשלומים שבוצעו": "PaymentsMade",
  "תשלומים שנותרו": "PaymentsRemaining",
  "אופן תשלום": "PaymentMethod",
  'הערות': "Notes",
  "תשובה למתרים": "ResponseToFundraiser",
  "יום הנצחה": "MemorialDay",
  'הנצחה': "Commemoration",
  'סכום': "Amount",
  'תאריך': "Date",
  'קמפיין': "CampainName",
  'קטגוריה': "CampainName",
  'קטגורייה': "CampainName",
  'סיבה': "reason"




};
export const hebrewToEnglisAlfonhMapping = {
  'מזהה אנש': 'AnashIdentifier',
  'שם': 'FirstName',
  'משפחה': 'LastName',
  'שם מלא': 'FullNameForLists',
  'כתובת': 'Address',
  'עיר': 'City',
  'מספר': 'AddressNumber',
  'מספר זהות': 'PersonID',
  'תז אב': 'FatherId',

  'שם האב': 'FatherName',
  'טל נייד': 'MobilePhone',
  'טל בית': 'HomePhone',
  'בית מדרש': 'BeitMidrash',
  'סיווג': 'Classification',
  'אופן התרמה': 'DonationMethod',
  'מתרים': 'fundRaiser',
  'למד בישיבה בשנים': 'StudiedInYeshivaYears',
  'שנה ישיג': 'yashagYear',
  'אחראי ועד': 'CommitteeResponsibility',
  'קבוצה למסיבה': 'PartyGroup',
  'שם מזמין למסיבה': 'PartyInviterName',
  'קומה': 'floor',
  'מיקוד': 'zipCode',
  'כניסה':'Entry',

  'נייד 1': 'MobilePhone',
  'נייד בבית 1': 'MobileHomePhone',
  'בית 1': 'HomePhone',
  'דוא"ל': 'Email',
  'מספר קבוצה': 'GroupNumber',
  'שדה חופשי': 'FreeFieldsToFillAlone',
  'שדה חופשי 2': 'AnotherFreeFieldToFillAlone',
  'הערות אלפון': 'PhoneNotes',
  'דרגה': 'Rank',

  'הערות': "Notes",
  "תשובה למתרים": "ResponseToFundraiser",
  'סיבה': "reason"
  
  
  

};

export const hebrewToEnglishCommitmentMapping = {
  'מזהה אנש': 'AnashIdentifier',
  'שם': 'FirstName',
  'משפחה': 'LastName',
  'קיבל מתנה': 'ReceivedGift',


  'מספר זהות': 'PersonID',
  
  'אופן התרמה': 'DonationMethod',
  'מתרים': 'Fundraiser',
  'למד בישיבה בשנים': 'StudiedInYeshivaYears',
  'שנה ישיג': 'yashagYear',
  'אחראי ועד': 'CommitteeResponsibility',
  'קבוצה למסיבה': 'PartyGroup',
  'שם מזמין למסיבה': 'PartyInviterName',
  
  
  
    "סכום התחייבות": "CommitmentAmount",
    "סכום שולם": "AmountPaid",
    "סכום שנותר": "AmountRemaining",
    "מספר תשלומים": "NumberOfPayments",
    "תשלומים שבוצעו": "PaymentsMade",
    "תשלומים שנותרו": "PaymentsRemaining",
    "אופן תשלום": "PaymentMethod",
    'הערות': "Notes",
    "תשובה למתרים": "ResponseToFundraiser",
    'קמפיין': "CampainName",
    'קטגוריה': "CampainName",
    'קטגורייה': "CampainName",
    'סיבה': "reason"
  };
  export const hebrewToEnglishPaymentsMapping = {
  'מזהה אנש': 'AnashIdentifier',
  'סכום': "Amount",
  'תאריך': "Date",
  'שם': "FirstName",
  'משפחה': "LastName",

  
  
    "אופן תשלום": "PaymentMethod",
    'שם קמפיין': "CampainName",
    'סיבה': "reason"

  };



  export const englishToHebrewAlfonhMapping = {
    AnashIdentifier: 'מזהה אנש',
    FirstName: 'שם',
    LastName: 'משפחה',

    
    FullNameForLists: 'שם מלא',
    Address: 'כתובת',
    City: 'עיר',
    AddressNumber: 'מספר',
    PersonID: 'מספר זהות',
    FatherId: 'תז אב',
    FatherName: 'שם האב',
    MobilePhone: 'טל נייד',
    MobileHomePhone: 'נייד בבית 1',
    HomePhone: 'טל בית',
    BeitMidrash: 'בית מדרש',
    Classification: 'סיווג',
    DonationMethod: 'אופן התרמה',
    fundRaiser: 'מתרים',
    StudiedInYeshivaYears: 'למד בישיבה בשנים',
    yashagYear: 'שנה ישיג',
    CommitteeResponsibility: 'אחראי ועד',
    PartyGroup: 'קבוצה למסיבה',
    PartyInviterName: 'שם מזמין למסיבה',
    floor: 'קומה',
    zipCode: 'מיקוד',
    Entry: 'כניסה',
    Email: 'דוא"ל',
    GroupNumber: 'מספר קבוצה',
    FreeFieldsToFillAlone: 'שדה חופשי',
    AnotherFreeFieldToFillAlone: 'שדה חופשי 2',
    PhoneNotes: 'הערות אלפון',
    Rank: 'דרגה',
    Notes: 'הערות',
    ResponseToFundraiser: 'תשובה למתרים',
    reason: 'סיבה'
  };
  
  export const englishToHebrewCommitmentMapping = {
    AnashIdentifier: 'מזהה אנש',
    FirstName: 'שם',
    LastName: 'משפחה',
    PersonID: 'מספר זהות',
    DonationMethod: 'אופן התרמה',
    Fundraiser: 'מתרים',
    fundRaiser: 'מתרים',
    StudiedInYeshivaYears: 'למד בישיבה בשנים',
    yashagYear: 'שנה ישיג',
    CommitteeResponsibility: 'אחראי ועד',
    PartyGroup: 'קבוצה למסיבה',
    PartyInviterName: 'שם מזמין למסיבה',
    CommitmentAmount: 'סכום התחייבות',
    AmountPaid: 'סכום שולם',
    AmountRemaining: 'סכום שנותר',
    NumberOfPayments: 'מספר תשלומים',
    PaymentsMade: 'תשלומים שבוצעו',
    PaymentsRemaining: 'תשלומים שנותרו',
    PaymentMethod: 'אופן תשלום',
    Notes: 'הערות',
    ResponseToFundraiser: 'תשובה למתרים',
    CampainName: ['קמפיין', 'קטגוריה', 'קטגורייה'],
    ReceivedGift: 'קיבל מתנה',

    reason: 'סיבה'
  };
  
  export const englishToHebrewPaymentsMapping = {
    AnashIdentifier: 'מזהה אנש',
    Amount: 'סכום',
    Date: 'תאריך',
    PaymentMethod: 'אופן תשלום',
    CampainName: 'שם קמפיין',
    reason: 'סיבה',
    FirstName: 'שם',
    LastName: 'משפחה',

  };
  export const englishToHebrewPPettyCashMapping = {
    FullNameOrReasonForIssue: 'סיבת הוצאה/שם',
    Amount: 'סכום',
    TransactionDate: 'תאריך',
    TransactionType: 'סוג תנועה',
    currentBalance: 'יתרה נוכחית',
  };

  export const englishToHebrewCommitmentReportMapping = {
    AnashIdentifier: 'מזהה אנש',
    FirstName: 'שם',
    LastName: 'משפחה',
    PersonID: 'מספר זהות',
    Fundraiser: 'מתרים',
    CommitmentAmount: 'סכום התחייבות',
    AmountPaid: 'סכום שולם',
    AmountRemaining: 'סכום שנותר',
    NumberOfPayments: 'מספר תשלומים',
    PaymentsMade: 'תשלומים שבוצעו',
    PaymentsRemaining: 'תשלומים שנותרו',
    PaymentMethod: 'אופן תשלום',
    Notes: 'הערות',
    ResponseToFundraiser: 'תשובה למתרים',
    CampainName: 'קמפיין',
    
    MobilePhone: 'טל נייד',
    MobileHomePhone: 'נייד בבית 1',
    HomePhone: 'טל בית',
    PreviousCommitments: 'התחייבותים הקודמות',
    BeitMidrash: 'בית מדרש',
    Classification: 'סיווג',
    DonationMethod: 'אופן התרמה',
   
    City: 'עיר',
    StudiedInYeshivaYears: 'למד בישיבה בשנים',
    yashagYear: 'שנה יש"ג',
    CommitteeResponsibility: 'אחראי ועד',
    PartyGroup: 'קבוצה למסיבה',
    GroupNumber: 'מספר קבוצה',
    PartyInviterName: 'שם מזמין למסיבה',
    FreeFieldsToFillAlone: 'שדה חופשי',
    AnotherFreeFieldToFillAlone: 'שדה חופשי 2',
    
    ReceivedGift: 'קיבל מתנה',

    ungrouped: 'ללא ערך בשדה הממיין דפים',
  

  
    };

    export const englishToHebrewPaymentsReportMapping = {
      AnashIdentifier: 'מזהה אנש',
      Amount: 'סכום',
      Date: 'תאריך',
      PaymentMethod: 'אופן תשלום',
      CampainName: 'שם קמפיין',
      
      FirstName: 'שם',
      LastName: 'משפחה',
      PersonID: 'מספר זהות',
      Fundraiser: 'מתרים',
      
      
      City: 'עיר',
      MobilePhone: 'טל נייד',
      MobileHomePhone: 'נייד בבית 1',
      HomePhone: 'טל בית',
      BeitMidrash: 'בית מדרש',
      Classification: 'סיווג',
      
      StudiedInYeshivaYears: 'למד בישיבה בשנים',
      yashagYear: 'שנה יש"ג',
      CommitteeResponsibility: 'אחראי ועד',
      PartyGroup: 'קבוצה למסיבה',
      GroupNumber: 'מספר קבוצה',
      PartyInviterName: 'שם מזמין למסיבה',
      FreeFieldsToFillAlone: 'שדה חופשי',
      AnotherFreeFieldToFillAlone: 'שדה חופשי 2',
      Notes: 'הערות',
      ungrouped: 'ללא ערך בשדה הממיין דפים',
    
  
    
      };
  

  


  
  
  
  
  
  













