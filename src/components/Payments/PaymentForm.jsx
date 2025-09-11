import { isNumber } from "lodash";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getCampains, getPeople } from "../../requests/ApiRequests";
import Spinner from "../General/Spinner";
import SearchCommitmmentTable from "./../commitments/SearchCommitmmentTable";

function PaymentForm({
  onSubmit,
  onClose,
  campainName = null,
  anashIdentifier = null,
}) {
  const [searchText, setSearchText] = useState("");
  const [people, setPeople] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const validPaymentMethods = [
    'מזומן',  'העברה בנקאית', 'הבטחה', 
    'משולב', 'כרטיס אשראי', 'שיקים', 'לא סופק', 
    'הוראת קבע', 'אשראי הו"ק','קיזוז',
  ];
  
  
  const [formData, setFormData] = useState({
    AnashIdentifier: anashIdentifier ? anashIdentifier : "",
    Amount: "",
    Date: new Date(),
    PaymentMethod: "",
    CampainName: campainName ? campainName : "",
  });
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (campainName) {
        return;
      }
      try {
        setIsLoading(true);
        const response = await getCampains();
        setCampaigns(response.data.data.campains); // הנחה שהמידע יושב במערך בשם data
      } catch (error) {
        toast.error("שגיאה בטעינת הקמפיינים");
      } finally {
        setIsLoading(false);
      }
    };
    const fetchPeople = async () => {
      try {
        setIsLoading(true);
        const response = await getPeople(true);
        setPeople(response.data.data.people);
      } catch (error) {
        toast.error("שגיאה בטעינת האנשים");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
    fetchPeople();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "Date") {
      // Convert the input value (string) back to a Date object
      setFormData({
        ...formData,
        Date: new Date(value),
      });
    } else {
      let numericValue = value;
      if (name === "Amount" )
        {
         numericValue = parseFloat(value);
       }
      setFormData({
        ...formData,
        [name]: numericValue,
      })

    }
  };
  function onSelectRow(data) {
    setFormData({
      ...formData,
      AnashIdentifier: data.AnashIdentifier,
      FirstName: data.FirstName,
      LastName: data.LastName,
    });
  }
  function onUnselectRow() {
    setFormData({
      ...formData,
      AnashIdentifier: "",
      FirstName: "",
      LastName: "",
    });
  }
  function handleSubmit(e) {
    // console.log('3333');
    e.preventDefault();
    if(formData.Amount && isNumber(formData.Amount) && formData.Amount <= 0){
      toast.error('הסכום לתשלום חייב להיות גדול מ-0');
      return;
      
    }
    onSubmit(formData);
    onClose();
  }
  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="w-full fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center rtl z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-h-[98vh] z-51">
        <input
          type="text"
          placeholder="חיפוש..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="block w-full mb-4 p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          disabled={anashIdentifier ? true : false}
        />

        {!anashIdentifier && (
          <SearchCommitmmentTable
            rowData={people}
            searchText={searchText}
            onSelectRow={onSelectRow}
            onUnselectRow={onUnselectRow}
          />
        )}
        <form
          className="flex flex-col gap-1 my-4 min-w-[400px]"
          onSubmit={handleSubmit}
        >
          <div className="flex justify-between">
            <label>אופן התשלום:</label>
            <select
              className="border border-gray-300 rounded-md outline-none"
              name="PaymentMethod"
              value={formData.PaymentMethod}
              onChange={handleChange}
              required
            >
              <option value="">בחר אופן תשלום</option>
              {validPaymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between">
            <label>קמפיין:</label>
            {campainName ? (
              <input
                className="border border-gray-300 rounded-md outline-none"
                type="text"
                name="CampainName"
                value={formData.CampainName}
                readOnly
                required
              />
            ) : (
              <select
                className="border border-gray-300 rounded-md outline-none"
                name="CampainName"
                value={formData.CampainName}
                onChange={handleChange}
              >
                <option value="">בחר קמפיין</option>
                {campaigns.map((campaign) => (
                  <option key={campaign._id} value={campaign.CampainName}>
                    {campaign.CampainName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-between gap-1">
            <label>מזהה אנש:</label>
            <input
              className="border border-gray-300 rounded-md outline-none"
              type="text"
              name="AnashIdentifier"
              value={formData.AnashIdentifier}
              onChange={(e) =>
                setFormData({ ...formData, AnashIdentifier: e.target.value })
              }
              readOnly
              required
            />
          </div>

          <div className="flex justify-between">
            <label>סכום :</label>
            <input
              className="border border-gray-300 rounded-md outline-none"
              type="Number"
              name="Amount"
              value={formData.Amount || ""}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-between">
            <label> תאריך:</label>
            <input
              className="border border-gray-300 rounded-md outline-none"
              type="date"
              name="Date"
              value={
                formData.Date ? formData.Date.toISOString().split("T")[0] : ""
              }
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              שמור טופס
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentForm;
