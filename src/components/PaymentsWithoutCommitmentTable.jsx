import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AiOutlineDelete } from "react-icons/ai";
import { GiConfirmed } from "react-icons/gi";
import { ToastContainer, toast } from "react-toastify";
import { ceil, min } from "lodash";
import {
  deletePayment,
  transferPayment,
  getUserDetails,
} from "../requests/ApiRequests";
import { FaExchangeAlt } from "react-icons/fa";

function PaymentsWithoutCommitmentTable({ rowsData = [] ,onSelectCampain}) {

  const hebrewToEnglishMapping = {
    "מזהה אנש": "AnashIdentifier",
    שם: "FirstName",
    משפחה: "LastName",
    "אופן תשלום": "PaymentMethod",
    סכום: "Amount",
    תאריך: "Date",
    קמפיין: "CampainName",
  };

  const [searchText, setSearchText] = useState("");
  


  const deleteActionCellRenderer = (props) => {
    return (
      <div className="h-full min-h-full ">
        <button
          className="action-button  p-1 px-2 text-xl bg-red-100	rounded-sm h-full min-h-full"
          onClick={() => handleDeletePayment(props.api, props.node)}
        >
          <AiOutlineDelete />
        </button>
      </div>
    );
  };

  async function handleDeletePayment(api, node) {
    const payment = node.data;

    try {
      const response = await deletePayment(payment._id);
      if (response.status === 200) {
        toast.success("התשלום נמחק בהצלחה");
        api.applyTransaction({
          remove: [payment],
        });
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  }

  const transferActionCellRenderer = (props) => {
    // const isDropDownVisible = selectedPaymentId === props.node.data._id;
    const payment  = props.node.data;
    const paymentId = payment._id;
    const campainsNames = props.node.data.AnashDetails.Campaigns;

    
    

  
    return (
      
          <div className="w-full h-full flex items-center justify-center">
            {/* <label className="block mb-2">בחר קמפיין</label> */}
            <select 
              className="w-full border rounded outline-none p-1"
              onChange={(e) => {
                e.preventDefault();
                
                onSelectCampain(payment,paymentId, e.target.value);
                
              }}
              key={paymentId}
            >
              <option value="">בחר קמפיין  </option>
              {campainsNames.map((campainName) => (
                <option key={campainName} value={campainName}>
                  {campainName}
                </option>
              ))}
            </select>
          </div>
        )}
   
  
  

  const columns = [
    {
      headerName: "מזהה אנש",
      field: "AnashIdentifier",
      editable: false,
      sortable: true,
      filter: true,
      width: 120, // This will sort the column from lowest to highest by default
    },
    {
      headerName: "שם",
      field: "FirstName",
      editable: false,
      sortable: true,
      filter: true,
    },
    {
      headerName: "משפחה",
      field: "LastName",
      editable: false,
      sortable: true,
      filter: true,
    },
    {
      headerName: "אופן תשלום",
      field: "PaymentMethod",
      editable: false,
      sortable: true,
      filter: true,
    },
    {
      headerName: "סכום",
      field: "Amount",
      editable: false,
      sortable: true,
      filter: true,
    },
    {
      headerName: "תאריך",
      field: "Date",
      editable: false,
      sortable: true,
      filter: true,
      // flex: 1,
      valueFormatter: (params) => {
        // Format the date as you prefer
        if (params.value) {
          return new Date(params.value).toLocaleDateString("he-IL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          // Or use a specific format like:
          // return moment(params.value).format('DD/MM/YYYY');
        }
        return "";
      },
      getQuickFilterText: (params) => {
        if (params.value) {
          return new Date(params.value).toLocaleDateString("he-IL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        }
        return "";
      },
    },

    {
      headerName: "העברת תשלום",
      cellRenderer: transferActionCellRenderer,
      editable: false,
      width: 150,
    },
    {
      headerName: "מחיקה",
      cellRenderer: deleteActionCellRenderer,
      editable: false,
      colId: "action",
      width: 150,
      flex: 1,
      minWidth: 100,
    },
  ];

  const hebrewFilterOptions = [
    {
      displayKey: "contains",
      displayName: "מכיל",
      test: (filterValue, cellValue) => {
        return (
          cellValue != null &&
          cellValue
            .toString()
            .toLowerCase()
            .indexOf(filterValue.toLowerCase()) >= 0
        );
      },
    },
    {
      displayKey: "startsWith",
      displayName: "מתחיל ב",
      test: (filterValue, cellValue) => {
        return (
          cellValue != null &&
          cellValue
            .toString()
            .toLowerCase()
            .startsWith(filterValue.toLowerCase())
        );
      },
    },
  ];
  const defaultColDef = {
    filterParams: {
      filterOptions: hebrewFilterOptions,
    },
    cellStyle: { textAlign: "right" }, // Centers text in all columns
    width: 150,
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-[80vw] flex justify-start">
        <input
          id="search"
          type="text"
          placeholder="חיפוש..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="m-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-sky-100 w-[200px]"
        />
      </div>
      <div className="ag-theme-alpine h-[78vh] max-h-[78vh] overflow-auto mx-auto w-[80vw] flex flex-col justify-center">
        <AgGridReact
          columnDefs={columns}
          rowData={rowsData}
          pagination={true}
          paginationPageSize={50} // Increase the pagination page size as needed
          domLayout="normal" // Use normal layout to keep grid within the container height
          enableRtl={true}
          quickFilterText={searchText}
          //   ref={gridRef}
          defaultColDef={{
            ...defaultColDef,
          }}
          gridOptions={{
            enableCellTextSelection: true,
            suppressCellFocus: true, // This prevents cell focus

          }}
        />
      </div>
    </div>
  );
}

export default PaymentsWithoutCommitmentTable;
