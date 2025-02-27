
import React, { useState, useEffect } from "react";
import { ReactJewishDatePicker } from "react-jewish-datepicker";
import "react-jewish-datepicker/dist/index.css";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { addCampain } from "../requests/ApiRequests";
import { getCampains } from "../requests/ApiRequests";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Spinner from "../components/Spinner";

function CampainsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [campains, setCampains] = useState([]);
  const [campainData, setCampainData] = useState({
    startDate: null,
    endDate: null,
    CampainName: "",
    minimumAmountForMemorialDay: ""
  });
  const [showAddCampainInputs, setShowAddCampainInputs] = useState(false);
  let [message, setmessage] = useState('');

  const handleDateChange = (key, day) => {
    console.log(key, day); // Check the structure of the day object
    setCampainData(prevData => ({
      ...prevData,
      [key]: day
    }));
  };

  const handleCampainNameChange = (e) => {
    setCampainData(prevData => ({
      ...prevData,
      CampainName: e.target.value
    }));
  };

  const handleMinimumAmountChange = (e) => {
    setCampainData((prevData) => ({
      ...prevData,
      minimumAmountForMemorialDay: e.target.value
    }));
  };

  const handleAddCampain = async () => {
    const { startDate, endDate, CampainName, minimumAmountForMemorialDay } = campainData;
    // console.log(startDate, CampainName, minimumAmountForMemorialDay);
    // console.log(campainData)
    if (!startDate || !endDate || !CampainName || !minimumAmountForMemorialDay) {
      setmessage("נא למלא את כל השדות");
      return;
    }
    if (startDate.date.getTime() > endDate.date.getTime()) {
      setmessage(" תאריך התחלה אינו יכול להיות גדול מתאריך הסיום");
      return;
    }
    
    try {
      setLoading(true);
    // console.log(startDate.date, endDate.date, CampainName, minimumAmountForMemorialDay);
      const res = await addCampain(campainData);
      toast.success("קמפיין נוסף בהצלחה!"); // הודעת Toast על הצלחה
      setCampains(prevCampains => [...prevCampains, res.data.data.newCampain]);
      setShowAddCampainInputs(false); // סגירת הטופס לאחר הצלחה
      setCampainData({ startDate: null, endDate: null, CampainName: "", minimumAmountForMemorialDay: "" }); // איפוס הטופס
      setmessage(""); // איפוס ההודעה
      
    } catch (error) {
      console.log(error);
      toast.error( error.response.data.message || "אירעה שגיאה בהוספת הקמפיין."); // הודעת Toast על שגיאה
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getCampains();
        setCampains(response.data.data.campains);
      } catch (error) {
        console.log(error);
      }
      finally {
        console.log('e');
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // if(loading) return <Spinner />

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">קמפיינים</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-6">
        {campains.map((campain) => (
          <button
          onClick={() => navigate(`/campain/${campain._id}?campainName=${encodeURIComponent(campain.CampainName)}&minimumAmountForMemorialDay=${campain.minimumAmountForMemorialDay}`)}
            className="p-3 bg-blue-200 text-blue-900 hover:bg-blue-300 transition-colors rounded-lg shadow-md"
            key={campain._id}
          >
            {campain.CampainName}
          </button>
        ))}
      </div>

      <button
        className={`text-2xl p-3 rounded-full transition-all shadow-lg ${showAddCampainInputs ? "bg-red-500 text-white hover:bg-red-600" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        onClick={() => setShowAddCampainInputs(!showAddCampainInputs)}
      >
        {showAddCampainInputs ? <IoMdClose /> : <IoMdAdd />}
      </button>

      {showAddCampainInputs && (
        <section className="w-full max-w-md bg-white p-6 mt-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">
            הוסף קמפיין חדש
          </h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="שם הקמפיין"
              className="border-2 p-2 w-full rounded-md focus:outline-none focus:border-blue-500"
              value={campainData.CampainName}
              onChange={handleCampainNameChange}
            />
          </div>

          <div className="mb-4">
            {campainData.startDate ? (
              <span className="text-blue-600">
                {campainData.startDate.jewishDateStrHebrew}
              </span>
            ) : (
              <span className="text-red-600">לא נבחר תאריך</span>
            )}
            <ReactJewishDatePicker
              onClick={(day) => handleDateChange("startDate", day)}
              isHebrew
              className="mt-2"
            />
          </div>

          <div className="mb-4">
            {campainData.endDate ? (
              <span className="text-blue-600">
                {campainData.endDate.jewishDateStrHebrew}
              </span>
            ) : (
              <span className="text-red-600">לא נבחר תאריך</span>
            )}
            <ReactJewishDatePicker
              onClick={(day) => handleDateChange("endDate", day)}
              isHebrew
              className="mt-2"
            />
          </div>

          <div className="mb-4">
            <p className="mb-1 text-blue-700">סכום מינימלי ליום הנצחה:</p>
            <input
              type="number"
              className="border-2 p-2 w-full rounded-md focus:outline-none focus:border-blue-500"
              value={campainData.minimumAmountForMemorialDay}
              onChange={handleMinimumAmountChange}
            />
          </div>

          <button
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors w-full"
            onClick={handleAddCampain}
          >
            הוסף קמפיין
          </button>
          {message && (
            <p className="text-red-500 mt-2 text-center">{message}</p>
          )}
        </section>
      )}
    </div>
  );
}

export default CampainsPage;