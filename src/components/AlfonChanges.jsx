import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import Spinner from './Spinner';

function AlfonChanges({ data, handelSubmit }) {
  const englishToHebrewMapping = {
    'anashIdentifier': 'מזהה אנש',
    'FullNameForLists': 'שם מלא',
    'FirstName': 'שם',
    'LastName': 'משפחה',
    'FatherName': 'שם האב',
    'IdentityNumber': 'מספר זהות',
    'Address': 'כתובת',
    'addressNumber': 'מספר',
    'floor': 'קומה',
    'zipCode': 'מיקוד',
    'City': 'עיר',
    'MobilePhone': 'נייד 1 ',
    'MobileHomePhone': 'נייד בבית 1',
    'HomePhone': 'בית 1',
    'Email': 'דוא"ל',
    'BeitMidrash': 'בית מדרש',
    'Classification': 'סיווג',
    'DonationMethod': 'אופן התרמה',
    'fundRaiser': 'מתרים',
    'StudiedInYeshivaYears': 'למד בישיבה בשנים',
    'yashagYear': 'שנה ישיג',
    'CommitteeResponsibility': 'אחראי ועד',
    'PartyGroup': 'קבוצה למסיבה',
    'GroupNumber': 'מספר קבוצה',
    'PartyInviterName': 'שם מזמין למסיבה',
    'isActive': 'פעיל',
    'FreeFieldsToFillAlone': 'שדה חופשי',
    'AnotherFreeFieldToFillAlone': 'שדה חופשי 2',
    'PhoneNotes': 'הערות אלפון',
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedNeedsUpadate, setUpdatedNeedsUpdate] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState({});

  useEffect(() => {
    if (Object.keys(data).length > 0 && Array.isArray(data.diffs)) {
      setIsModalOpen(true);
      // Initialize selectedProperties with existing person's properties
      const initialSelectedProperties = {};
      data.diffs.forEach(diff => {
        if (diff && diff.existingPerson) {
          initialSelectedProperties[diff.anashIdentifier] = Object.keys(diff.existingPerson).reduce((acc, key) => {
            acc[key] = 'existing';
            return acc;
          }, {});
        }
      });
      setSelectedProperties(initialSelectedProperties);
      console.log(initialSelectedProperties);
    }
  }, [data]);

  function getDisplayedvalue(value) {
    // console.log(value);
    if (typeof value === 'boolean') {
      return value ? 'כן' : 'לא';
    }
    return value ? value : 'ערך לא קיים';  // returns 'ערך לא קיים'
  }

  const changeModalState = () => {
    setIsModalOpen(!isModalOpen);
    window.location.reload(true);
  };

  const handlePropertySelect = (anashIdentifier, key, source) => {
    setSelectedProperties(prev => ({
      ...prev,
      [anashIdentifier]: {
        ...(prev[anashIdentifier] || {}),
        [key]: source
      }
    }));
  };

  const handleSelectAll = (anashIdentifier, source) => {
    const diff = data.diffs.find(diff => diff.anashIdentifier === anashIdentifier);
    if (diff && diff.existingPerson) {
      const allProperties = Object.keys(diff.existingPerson);
      setSelectedProperties(prev => ({
        ...prev,
        [anashIdentifier]: allProperties.reduce((acc, key) => {
          acc[key] = source;
          return acc;
        }, {})
      }));
    }
  };

  const clearAnashArray = () => {
    setUpdatedNeedsUpdate([]);
    setSelectedProperties({});
    changeModalState();
  };

  const handleSubmit = () => {
    const updatedObjects = data.diffs.map(diff => {
      if (!diff || !diff.existingPerson || !diff.uploadedPerson) {
        console.error('Invalid diff object:', diff);
        return null;
      }
      const selectedProps = selectedProperties[diff.anashIdentifier] || {};
      // console.log(selectedProps);
      const updatedObject = { anashIdentifier: diff.anashIdentifier };
      // console.log(updatedObject);

      Object.keys(selectedProps).forEach(key => {
        updatedObject[key] = selectedProps[key] === 'existing' ? diff.existingPerson[key] || '' : diff.uploadedPerson[key] || '';
      });
      return updatedObject;
    }).filter(Boolean);
    // console.log(data);
    // console.log(data.new);
    // console.log(data.needsUpdate);
    console.log(updatedObjects);

    handelSubmit(data.new, data.needsUpdate, updatedObjects);
    changeModalState();
  };

  return (
    <div>
      <Modal
        isOpen={isModalOpen}
        contentLabel="Confirm Changes"
        className="fixed inset-0 flex items-center justify-center overflow-hidden rtl"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <div className="bg-white p-6 rounded shadow-lg w-[90vw] h-[90vh] flex flex-col overflow-hidden relative">
        <div className="mb-4">
      תורמים חדשים: {data.statusCounts.new}
    </div>
    <div className="mb-4">
      תורמים קיימים: {data.statusCounts.exists}
    </div>
      <div className="mb-2">
        תורמים קיימים עם שינוי בפרטים: {data.statusCounts.needsUpdate}
      </div>

          <div className="flex-1 overflow-auto">
            {Array.isArray(data.diffs) && data.diffs.map((dif, index) => {
              if (!dif || !dif.existingPerson || !dif.uploadedPerson) {
                console.error('Invalid diff object:', dif);
                return null;
              }
              return (
                <div key={index} className="bg-green-200 mb-[50px]">
                  <div className="mb-2">
                    <span>מזהה אנש: {dif.anashIdentifier}</span>
                    <span className="mr-4">שם מלא: {dif.fullName}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {Object.keys(dif.existingPerson).map((key, index) => (
                      <div key={index} className="flex w-full justify-between">
                        <span 
                          className={`bg-blue-200 text-right w-1/2 pr-2 cursor-pointer ${selectedProperties[dif.anashIdentifier]?.[key] === 'existing' ? 'border-2 border-blue-500' : ''}`}
                          onClick={() => handlePropertySelect(dif.anashIdentifier, key, 'existing')}
                        >
                          {englishToHebrewMapping[key]} : {getDisplayedvalue(dif.existingPerson[key])}
                        </span>
                        <span 
                          className={`bg-orange-200 text-right w-1/2 pl-2 cursor-pointer ${selectedProperties[dif.anashIdentifier]?.[key] === 'uploaded' ? 'border-2 border-orange-500' : ''}`}
                          onClick={() => handlePropertySelect(dif.anashIdentifier, key, 'uploaded')}
                        >
                          {englishToHebrewMapping[key]} : {getDisplayedvalue(dif.uploadedPerson[key])}
                        </span>
                      </div>
                    ))}
<div className="flex justify-between mb-2 mr-2">
  {/* Container for the first button, placed at the right side */}
  <div className="flex flex-1 justify-start">
    <button
      onClick={() => handleSelectAll(dif.anashIdentifier, 'existing')}
      className="bg-blue-500 text-white px-4 py-2 rounded w-[150px]"
    >
      בחר הכל ישן
    </button>
  </div>

  {/* Container for the second button, positioned at the start of the left half */}
  <div className="flex flex-1 justify-start">
    <button
      onClick={() => handleSelectAll(dif.anashIdentifier, 'uploaded')}
      className="bg-orange-500 text-white px-4 py-2 rounded w-[150px]"
    >
      בחר הכל חדש
    </button>
  </div>
</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50">
            <button onClick={handleSubmit} className="text-blue-500 bg-green-200 px-4 py-2 rounded shadow mr-2">
              אישור
            </button>
          </div>
          <div className="absolute top-0 left-0">
            <button onClick={() => clearAnashArray()} className="text-blue-500 bg-red-200 px-4 py-2 rounded shadow">X</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AlfonChanges