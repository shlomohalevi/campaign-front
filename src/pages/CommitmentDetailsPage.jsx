import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCommitmentDetails, deleteCommitment, updateCommitmentDetails, uploadPayment, getCampains } from '../requests/ApiRequests';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function CommitmentDetailsPage() {
  const { commitmentId } = useParams();
  const navigate = useNavigate();
  const [commitmentDetails, setCommitmentDetails] = useState({});
  const [editedData, setEditedData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // עבור הטופס להוספת תשלום
  const [payments, setPayments] = useState([]);
  const [paymentData, setPaymentData] = useState({ Amount: '', Date: '', PaymentMethod: '' }); // נתוני התשלום


  const openModal = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const closeModal = (e) => {
    setIsModalOpen(false);
  };
  const openPaymentModal = (e) => {
    e.preventDefault();
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = (e) => {
    setIsPaymentModalOpen(false);
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: value,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCommitmentDetails({
      ...commitmentDetails,
      [name]: value,
    });
    setEditedData({
      ...editedData,
      [name]: value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Extract values for validation
    const commitmentAmount = parseFloat(commitmentDetails.CommitmentAmount) || 0;
    const amountPaid = parseFloat(commitmentDetails.AmountPaid) || 0;
    const amountRemaining = parseFloat(commitmentDetails.AmountRemaining) || 0;
    const numberOfPayments = parseInt(commitmentDetails.NumberOfPayments, 10) || 0;
    const paymentsMade = parseInt(commitmentDetails.PaymentsMade, 10) || 0;
    const paymentsRemaining = parseInt(commitmentDetails.PaymentsRemaining, 10) || 0;

    // Validation checks
    if (amountPaid > commitmentAmount) {
      toast.error('הסכום ששולם לא יכול להיות גדול מסכום ההתחייבות');
      return;
    }

    if (amountRemaining > commitmentAmount) {
      toast.error('הסכום שנותר לתשלום לא יכול להיות גדול מסכום ההתחייבות');
      return;
    }
    if (amountRemaining < 0) {
      toast.error('הסכום שנותר לתשלום לא יכול להיות קטן מ-0');
      return;
    }

    if (paymentsRemaining < 0) {
      toast.error('מספר התשלומים שנותרו לא יכול להיות קטן מ-0');
      return;
    }

    if (paymentsRemaining > numberOfPayments) {
      toast.error('מספר התשלומים שנותרו לא יכול להיות גדול מסך התשלומים');
      return;
    }

    if (paymentsMade > numberOfPayments) {
      toast.error('מספר התשלומים שבוצעו לא יכול להיות גדול מסך התשלומים');
      return;
    }

    if (Object.keys(editedData).length > 0) {
      try {
        setIsLoading(true);
        const commitmentEditedData = { ...editedData, commitmentId: commitmentDetails._id };
        const response = await updateCommitmentDetails(commitmentDetails._id, commitmentEditedData);
        setCommitmentDetails(response.data.data.updateCommitmentDetails);
        toast.success('הפרטים נשמרו בהצלחה', {
          onClose: () => setIsLoading(false)
        });
      } catch (error) {
        setIsLoading(false);
        console.error('Error updating commitment:', error);
      } finally {
        setEditedData({});
      }
    }
  };


  const handleDelete = async () => {
    if (!commitmentId) {
      console.error('No commitment ID provided.');
      return;
    }
    try {
      setIsLoading(true);
      const response = await deleteCommitment(commitmentId);
      console.log(response);
      if (response.status === 200) {
        toast.success('ההתחייבות נמחקה בהצלחה!');
        setTimeout(() => {
          navigate('/commitment'); // נווט לדף ההתחייבויות לאחר המחיקה
        }, 2000); // עיכוב של 2 שניות לפני הניווט
      } else {
        toast.error('שגיאה במחיקת ההתחייבות');
      }
    } catch (error) {
      toast.error('שגיאה במחיקת ההתחייבות');
      console.error('Error deleting commitment:', error);
    } finally {
      setIsLoading(false);
      closeModal();
    }
  };
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!commitmentId) {
      console.error('Commitment ID is missing');
      return;
    }

    const paymentAmount = parseFloat(paymentData.Amount);
    const remainingAmount = commitmentDetails.AmountRemaining;
    const paymentsRemaining = commitmentDetails.PaymentsRemaining;
    const AnashIdentifier = commitmentDetails.AnashIdentifier;

    // Validation before proceeding with payment
    if (paymentAmount <= 0) {
      toast.error('הסכום לתשלום חייב להיות גדול מ-0');
      return;
    }
    if (remainingAmount <= 0) {
      toast.error('לא ניתן להוסיף תשלום כשיתרת התשלום היא 0');
      return;
    }
    if (paymentAmount > remainingAmount) {
      toast.error('הסכום לתשלום לא יכול לחרוג מהיתרה לתשלום');
      return;
    }
    if (paymentsRemaining <= 0) {
      toast.error('לא ניתן להוסיף תשלום כשלא נותרו תשלומים');
      return;
    }

    try {
      // Update the commitment first
      const updateStatus = await updateCommitmentAfterPayment(commitmentId, paymentAmount);

      if (updateStatus) {
        // If the update was successful, proceed to upload the payment
        const paymentDataWithId = {
          ...paymentData,
          CommitmentId: commitmentId,
          AnashIdentifier: AnashIdentifier // הוספת מזהה אנש לבקשת התשלום
        };
        const response = await uploadPayment(paymentDataWithId);

        if (response && response.status === 200) {
          const updatedCommitmentDetails = await getCommitmentDetails(commitmentId);
          setCommitmentDetails(updatedCommitmentDetails.data.commitmentDetails);

          toast.success('התשלום עודכן בהצלחה!');
          closePaymentModal();
        } else {
          toast.error('עידכון התשלום נכשל!');
        }
      } else {
        toast.error('עידכון התשלום נכשל!');
      }
    } catch (error) {
      toast.error('שגיאה בעדכון התשלום');
      console.error('Error saving payment:', error);
    }
  };

  const updateCommitmentAfterPayment = async (commitmentId, paymentAmount) => {
    try {
      const response = await getCommitmentDetails(commitmentId);
      const commitment = response.data.commitmentDetails;

      if (!commitment) {
        throw new Error('Commitment not found');
      }

      const updatedAmountPaid = (commitment.AmountPaid || 0) + paymentAmount;
      const updatedAmountRemaining = (commitment.CommitmentAmount || 0) - updatedAmountPaid;
      const updatedPaymentsMade = (commitment.PaymentsMade || 0) + 1;
      const updatedPaymentsRemaining = (commitment.PaymentsRemaining || 0) - 1;

      // בדיקות תקינות לאחר העדכון
      if (updatedAmountPaid > commitment.CommitmentAmount) {
        toast.error('הסכום ששולם לא יכול לחרוג מסכום ההתחייבות');
        console.error('Amount paid cannot exceed commitment amount.');
        return false;
      }
      if (updatedAmountRemaining < 0) {
        toast.error('סכום התשלום חורג מהיתרה שנותרה לתשלום');
        console.error('Payment amount exceeds remaining amount.');
        return false;
      }
      if (updatedAmountRemaining > commitment.CommitmentAmount) {
        toast.error('הסכום שנותר לתשלום לא יכול לחרוג מסכום ההתחייבות');
        console.error('Remaining amount cannot exceed commitment amount.');
        return false;
      }
      if (updatedPaymentsRemaining < 0) {
        toast.error('מספר התשלומים שנותרו אינו יכול להיות שלילי');
        console.error('Number of remaining payments cannot be negative.');
        return false;
      }
      if (updatedPaymentsMade > commitment.NumberOfPayments) {
        toast.error('מספר התשלומים שבוצעו לא יכול לחרוג מסך התשלומים שהוגדרו');
        console.error('Number of payments made cannot exceed total number of payments.');
        return false;
      }

      await updateCommitmentDetails(commitmentId, {
        AmountPaid: updatedAmountPaid,
        AmountRemaining: updatedAmountRemaining,
        PaymentsMade: updatedPaymentsMade,
        PaymentsRemaining: updatedPaymentsRemaining
      });

      return true;
    } catch (error) {
      console.error('Error updating commitment after payment:', error);
      return false;
    }
  };




  useEffect(() => {
    const fetchCommitmentDetails = async () => {
      try {
        const result = await getCommitmentDetails(commitmentId);
        if (result.data) {
          const { commitmentDetails, payments } = result.data;
          setCommitmentDetails(commitmentDetails || {});
          setPayments(Array.isArray(payments) ? payments : [payments]);
        }
      } catch (error) {
        console.error('Error fetching commitment details:', error);
        toast.error('שגיאה בטעינת נתוני ההתחייבות');
      }
    };

    if (commitmentId) {
      fetchCommitmentDetails();
    }
  }, [commitmentId]);

  const [campaigns, setCampaigns] = useState([]);
  useEffect(() => {
    const fetchCampaigns = async () => {
        try {
            const response = await getCampains();
            setCampaigns(response.data.data.campains); // הנחה שהמידע יושב במערך בשם data
        } catch (error) {
            toast.error('שגיאה בטעינת הקמפיינים');
        }
    };

    fetchCampaigns();
}, []);


  return (
    <>
      <ToastContainer autoClose={5000} />

      <form className="max-w-7xl mx-auto p-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-[20px]">
          <label>
            מזהה אנש:
            <input
              type="text"
              name="AnashIdentifier"
              value={commitmentDetails.AnashIdentifier || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              readOnly
            />
          </label>
          <label>
            מספר זהות:
            <input
              type="text"
              name="PersonID"
              value={commitmentDetails.PersonID || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              readOnly
            />
          </label>
          <label>
            שם:
            <input
              type="text"
              name="FirstName"
              value={commitmentDetails.FirstName || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label>
            משפחה:
            <input
              type="text"
              name="LastName"
              value={commitmentDetails.LastName || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label>
            סכום התחייבות:
            <input
              type="number"
              name="CommitmentAmount"
              value={commitmentDetails.CommitmentAmount || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label>
            סכום שולם:
            <input
              type="number"
              name="AmountPaid"
              value={commitmentDetails.AmountPaid || 0}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label>
            סכום שנותר:
            <input
              type="number"
              name="AmountRemaining"
              value={commitmentDetails.AmountRemaining || 0}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label>
            מספר תשלומים:
            <input
              type="number"
              name="NumberOfPayments"
              value={commitmentDetails.NumberOfPayments || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label>
            תשלומים שבוצעו:
            <input
              type="number"
              name="PaymentsMade"
              value={commitmentDetails.PaymentsMade || 0}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label>
            תשלומים שנותרו:
            <input
              type="number"
              name="PaymentsRemaining"
              value={commitmentDetails.PaymentsRemaining || 0}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label>
            מתרים:
            <input
              type="text"
              name="Fundraiser"
              value={commitmentDetails.Fundraiser || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label>
            אופן התשלום:
            <select
              name="PaymentMethod"
              value={commitmentDetails.PaymentMethod || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">בחר אופן תשלום</option>
              <option value="מזומן">מזומן</option>
              <option value="שיק">שיק</option>
              <option value="אשראי">אשראי</option>
              <option value="הו&quot;ק אשראי">הו"ק אשראי</option>
              <option value="העברה בנקאית">העברה בנקאית</option>
              <option value="הו&quot;ק בנקאית">הו"ק בנקאית</option>
            </select>
          </label>
          <label>
            הערות:
            <input
              type="text"
              name="Notes"
              value={commitmentDetails.Notes || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label>
            תשובה למתרים:
            <input
              type="text"
              name="ResponseToFundraiser"
              value={commitmentDetails.ResponseToFundraiser || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label>
            יום הנצחה:
            <input
              type="date"
              name="MemorialDay"
              value={commitmentDetails.MemorialDay ? commitmentDetails.MemorialDay.substring(0, 10) : ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label>
            הנצחה:
            <input
              type="text"
              name="Commemoration"
              value={commitmentDetails.Commemoration || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label>
            קמפיין:
            <select
              name="CampainName"
              value={commitmentDetails.CampainName || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">בחר קמפיין</option>
              {campaigns.map((campaign) => (
                <option key={campaign._id} value={campaign.CampainName}>
                  {campaign.CampainName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="submit"
          className="m-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          אשר עדכון פרטים
        </button>
        <button
          className="m-4 p-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={openPaymentModal}
          disabled={isLoading}
        >
          הוסף תשלום
        </button>
        <button
          className="m-4 p-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={openModal}
          disabled={isLoading}
        >
          מחק התחייבות
        </button>
      </form>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Confirm Deletion"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">אישור מחיקה</h2>
          <p className="mb-4">האם אתה בטוח שברצונך למחוק את ההתחייבות?</p>
          <div className="flex justify-end">
            <button
              className="mr-2 p-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              onClick={closeModal}
              disabled={isLoading}
            >
              ביטול
            </button>
            <button
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={handleDelete}
              disabled={isLoading}
            >
              מחק
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isPaymentModalOpen}
        onRequestClose={closePaymentModal}
        contentLabel="Add Payment"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">הוסף תשלום</h2>
          <form onSubmit={handlePaymentSubmit}>
            <label>
              סכום:
              <input
                type="number"
                name="Amount"
                value={paymentData.Amount}
                onChange={handlePaymentChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                required
              />
            </label>
            <label>
              תאריך:
              <input
                type="date"
                name="Date"
                value={paymentData.Date}
                onChange={handlePaymentChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                required
              />
            </label>
            <label>
              אמצעי תשלום:
              <select
                name="PaymentMethod"
                value={paymentData.PaymentMethod}
                onChange={handlePaymentChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">בחר אופן תשלום</option>
                <option value="מזומן">מזומן</option>
                <option value="שיק">שיק</option>
                <option value="אשראי">אשראי</option>
                <option value="הו&quot;ק אשראי">הו"ק אשראי</option>
                <option value="העברה בנקאית">העברה בנקאית</option>
                <option value="הו&quot;ק בנקאית">הו"ק בנקאית</option>
              </select>

            </label>
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded"
                disabled={isLoading}
              >
                שמור תשלום
              </button>
              <button
                className="mr-4 px-4 py-2 bg-red-500 text-white rounded"
                onClick={closePaymentModal}
              >
                ביטול
              </button>
            </div>
          </form>
        </div>
      </Modal>
      <div className="max-w-7xl mx-auto p-3">
        <h3 className="text-lg font-semibold mb-4">תשלומים קשורים</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">סכום</th>
                <th className="px-4 py-2 border-b">תאריך</th>
                <th className="px-4 py-2 border-b">אמצעי תשלום</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment) => {
                  return (
                    <tr key={payment._id}>
                      <td className="px-4 py-2 border-b text-center">{payment.Amount}</td>
                      <td className="px-4 py-2 border-b text-center">
                        {new Date(payment.Date).toLocaleDateString('he-IL')}
                      </td>
                      <td className="px-4 py-2 border-b text-center">{payment.PaymentMethod}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-4 py-2 border-b text-center" colSpan="3">
                    אין תשלומים להצגה
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </>
  );
}

export default CommitmentDetailsPage;
