import { useNavigate ,useParams} from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { reviewCommitmentsPayments,uploadCommitmentsPayments } from "../requests/ApiRequests";
import ReviewPaymentsModal from "./ReviewPaymentsModal";
import PaymentForm from "./PaymentForm";
import Spinner from "./Spinner";



function Payments() {
  const hebrewToEnglishMapping = {
    "הערות": "AnashIdentifier",
    'מזהה אנש': "AnashIdentifier",
    "מספר זהות": "PersonID",
    'שם': "FirstName",
    'משפחה': "LastName",
    "סכום התחייבות": "CommitmentAmount",
    "סכום שולם": "AmountPaid",
    "סכום שנותר": "AmountRemaining",
    "מספר תשלומים": "NumberOfPayments",
    "תשלומים שבוצעו": "PaymentsMade",
    "תשלומים שנותרו": "PaymentsRemaining",
    'מתרים': "Fundraiser",
    "מותג": "PaymentMethod",
    "תנועה": "PaymentMethod",
    "תשובה למתרים": "ResponseToFundraiser",
    "יום הנצחה": "MemorialDay",
    'הנצחה': "Commemoration",
    "מספר התחייבות": "CommitmentId",
    'סכום': "Amount",
    'תאריך עסקה': "Date",
    'תאריך': "Date",
    'קמפיין': "CampainName",
  };
    

  const fileRef = useRef(null);
  const [validPayments, setValidPayments] = useState([]);
  const [invalidPayments, setInvalidPayments] = useState([]);
  const [showPaymentsForm, setShowPaymentsForm] = useState(false);
  const { campainName } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  function parseExcelDate(value) {
    // Check if value is a number, which Excel often uses for dates
    const dateObject = XLSX.SSF.parse_date_code(value);
    return new Date(dateObject.y, dateObject.m - 1, dateObject.d);
  }
  function getPaymentMethod(hebrewHeader,cellValue) {
    if(!cellValue)
      return null
    else if(hebrewHeader === 'מותג')
    {
      return 'הו"ק אשראי'
    }
    else if(hebrewHeader === 'תנועה' && cellValue ==='שידור')
    {
      return 'הו"ק בנקאית'
    }
    else
    {
      return null
    }
      
    
    
  }
   const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      let json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      json = json.filter((row) =>
        row.some((cell) => cell !== null && cell !== undefined && cell !== "")
      );
      if (!json || json.length === 0 || json.length === 1) {
        toast.error("אין נתונים בקובץ");
        return;
      }

      fileRef.current.value = null;

      const headers = json[0];
      const rows = json.slice(1);

      const mappedDataToEnglish = rows.map((row) => {
        const mappedRow = {};
        headers.forEach((header, index) => {
          const englishKey = hebrewToEnglishMapping[header];
          if (englishKey) {
            // console.log(englishKey);
            if (englishKey === "Date" && typeof row[index] === "number") {
              mappedRow[englishKey] = parseExcelDate(row[index]);

            }
            else if (englishKey === "PaymentMethod") 
              {

                mappedRow[englishKey] = getPaymentMethod(header,row[index]);
            }
             else {
              mappedRow[englishKey] = row[index];
            }
          }
        });
        return mappedRow;
      });
      console.log(mappedDataToEnglish);
      onReviewPayments(mappedDataToEnglish);
    };
    reader.readAsArrayBuffer(file);
  };
  async function onReviewPayments(payments) {
    console.log('e');
    try {
      // Send the mapped data to reviewCommitments
      setIsLoading(true);
      const response = await reviewCommitmentsPayments(payments,campainName);
      console.log(response.data);
      setValidPayments(response.data.validPayments);
      setInvalidPayments(response.data.invalidPayments);
      //     console.log(response);

      // Optionally store the uploaded data
    } catch (error) {
      console.error("Error during reviewCommitments:", error);
    }
    finally
    {
      setIsLoading(false);
    }
  }

  async function onUploadPayments() {
    const paymentsToUpload = [...validPayments];
    setInvalidPayments([]);
    setValidPayments([]);

    if (paymentsToUpload?.length == 0) {
      toast.error("אין נתונים לשליחה");
      return;
    } else {
        try
        {
          setIsLoading(true);
          const response = await uploadCommitmentsPayments(paymentsToUpload);
          console.log(response);
          toast.success("תשלום/ים נוספו בהצלחה");
        }
        catch(error)
        {
          console.log(error);
          toast.error(error.response.data.message);
        }
        finally
        {
          setIsLoading(false);
        }
    }
  }
  if(isLoading)
  {
    return <Spinner/>
  }

  return (
    <>
      <div className="flex items-center">
        <input
          type="file"
          id="paymentsFile"
          name="file"
          onChange={handleFileUpload}
          ref={fileRef}
          className="hidden"
        />
        <button
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded ml-4"
          onClick={() => fileRef.current && fileRef.current.click()}
        >
          בחר קובץ תשלומים
        </button>
        <button
          className="bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded ml-4"
          onClick={() => setShowPaymentsForm(true)}
        >
           מלא טופס תשלום
        </button>
        
      </div>
      {(validPayments?.length > 0 || invalidPayments?.length > 0) && (
        <ReviewPaymentsModal
          onUploadPayments={onUploadPayments}
          validPayments={validPayments}
          invalidPayments={invalidPayments}
          onClose={() => {
            setValidPayments([]);
            setInvalidPayments([]);
          }}
        />
      )}

      {showPaymentsForm && (
        <PaymentForm
          onSubmit={ onReviewPayments}
          onClose={() => setShowPaymentsForm(false)}
          campainName={campainName}
        />
      )}
    </>
  );
}

export default Payments;
