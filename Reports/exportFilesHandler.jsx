
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';








  const isDate = function(date) {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

  





export const exportToExcel = async (data,columns,columsMapping, fileName) => {
  // console.log(columns);
  const dataToExport = [...data];
  data = [];
   
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // Add headers with bold formatting
  // let headers = columns;
  
//  headers = [...new Set(headers.filter(header => dataToExport.some(item => header in item)))];

  // Set column configuration using Hebrew headers
  worksheet.columns = columns.map(header => ({
      header: columsMapping[header]|| header,
      key: header,
      width: 14
  }));
  // console.log(worksheet.columns);

  // Make headers bold
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
      cell.font = { 
          bold: true 
      };
  });

  // Add data rows with right alignment
  dataToExport.forEach(item => {
      const row = {};
      columns.forEach(header => {
          
          if (isDate(item[header]) && (header === 'Date'|| header === 'TransactionDate')) {
              row[header] = format(new Date(item[header]), 'dd/MM/yyyy');
          } else {
              row[header] = item[header];
          }
      });
      // console.log(row);
      
      const worksheetRow = worksheet.addRow(row);

      // Apply right alignment to all cells in the row
      worksheetRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.alignment = {
              horizontal: 'right',
              vertical: 'middle',
          };
      });
  });
  // console.log(workbook);
 
  // Generate the Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Create and save the file
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName + '.xlsx');
};
 
 
 function fixEn(str,key) {
   if (/[א-ת]/.test(String(str))) return str;
   
   if(isDate(str) && (key === 'Date'|| key === 'TransactionDate')) 
   {
    // console.log(format(new Date(str), 'dd/MM/yyyy'));

     str = format(new Date(str), 'dd/MM/yyyy');
   }
  let reversedStr =  String(str).split("").reverse().join("");
  return reversedStr;
}

function isEn(str) 
{
  return !/[א-ת]/.test(String(str));
  
}


 export const exportToPDF = (data,columns,columsMapping, fileName) => {
  try {
    console.log(data);
    const  dataToExport = [...data];
    data = [];

    // Create a new jsPDF instance
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });
  
    // Add the font to VFS (from the public folder)
    doc.addFileToVFS('ARIAL.TTF', '/ARIAL.TTF');
    doc.addFont('/ARIAL.TTF', 'ArialHebrew', 'normal');
  
    // Set the font to use the Hebrew font
    doc.setFont('ArialHebrew');
  
    // Add title
    doc.setFontSize(40);
    doc.setR2L(true);
    // doc.text(reverseHebrewText(fileName), 280, 10, { align: 'right' }); // Reverse fileName if in Hebrew
  
  
    // Prepare rows data (reverse each row and handle Hebrew text)
    let rows = dataToExport.map(item =>
      columns.map(column => {
        const value = item[column];
        return value ? fixEn(value,column) : '';
      
      }).reverse() // Reverse the row for proper RTL alignment
    );
columns= columns.map(column =>  columsMapping[column]);
    
    // Generate the table with RTL support
    doc.autoTable({
      head: [columns.reverse()], // Reverse column headers for RTL
      body: rows,
      startY: 20,
      styles: {
        font: 'ArialHebrew',
        fontSize: 10,
        cellPadding: 1,
        halign: 'right', // Right-align text
        overflow: 'linebreak',
      
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
      },
    });
    // console.log(dataToExport);
  
    // Save the PDF
    doc.save(`${fileName}.pdf`);
  } catch (error) {
    console.error(error);
  }
  };
  export const exportReportCommitmentsToPDF = (data, columsMapping, fileName, groupByProperty = 'ungrouped',preview=true) => {
    console.log(groupByProperty);
    
    try {
      const flatData = Object.values(data).flat();
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      doc.addFileToVFS('ARIAL.TTF', '/ARIAL.TTF');
      doc.addFont('/ARIAL.TTF', 'ArialHebrew', 'normal');
      doc.setFont('ArialHebrew');
      doc.setFontSize(40);
      doc.setR2L(true);

      // let columns = Object.keys(columsMapping);
      let dynamicColumns = Array.from(
        new Set(
          flatData.flatMap((item) => Object.keys(item))
        )
    );
      let columns = [...dynamicColumns];
      
      let currentY = 20;
      let previousGroup = null;
      // console.log(data);

      Object.entries(data).forEach(([groupKey, groupItems]) => {
        
          if (previousGroup !== null) {
            doc.addPage();
            currentY = 20;
          }
          if(groupKey === 'ungrouped')
          {
            groupKey = columsMapping[groupKey];
          }
          
          // doc.setFontSize(16);
          // doc.text(`${columsMapping[groupByProperty]}: ${groupKey}`, 20, currentY);
          // currentY += 10;
        

        const rows = groupItems.map(item =>
          columns.map(column => {
            const value = item[column];
            return value || value === 0 ? fixEn(value, column) : '';
          }).reverse()
        );
        // console.log(rows);


        doc.autoTable({
          head: [columns.map(column => isEn(column) ? columsMapping[column] : column).reverse()],
          body: rows,
          startY: currentY,
          styles: {
            font: 'ArialHebrew',
            fontSize: 9,
            cellPadding: 1,
            halign: 'right',
            overflow: 'linebreak',
          },
          headStyles: {
            fillColor: [200, 200, 200],
            textColor: [0, 0, 0],
          },
          
          didDrawPage: function(data) {
              // Set font for page number
              doc.setFont('ArialHebrew');
              doc.setFontSize(12);
              const pageWidth = doc.internal.pageSize.getWidth();

              doc.text(`בס"ד`, pageWidth - 20, 10, { align: 'right' , dir: 'rtl' });
              doc.text(`${columsMapping[groupByProperty]||''}: ${groupKey}`, 20, 10);

    
          
              // Add page number to all pages
              doc.text(
                `דף ${fixEn(data.pageNumber, 'pageCount')}`, 
                doc.internal.pageSize.getWidth() - 30, 
                doc.internal.pageSize.getHeight() - 10
              );
            
          }
          
        });

        currentY = doc.lastAutoTable.finalY + 10;
        previousGroup = groupKey;
      });

      if (preview) {
        // Generate a Blob and create an object URL for preview
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
  
        // Open the preview in a new tab or iframe
        window.open(pdfUrl, '_blank'); // New tab preview
      } else {
        // Save the PDF
        doc.save(`${fileName}.pdf`);
      }
  
    } catch (error) {
      console.error(error);
    }
  };

  export const exportReportpaymentsToPDF = (data, columsMapping, fileName,preview=true) => {
    
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      doc.addFileToVFS('ARIAL.TTF', '/ARIAL.TTF');
      doc.addFont('/ARIAL.TTF', 'ArialHebrew', 'normal');
      doc.setFont('ArialHebrew');
      doc.setFontSize(40);
      doc.setR2L(true);

      // let columns = Object.keys(columsMapping);
      let dynamicColumns = Array.from(
        new Set(
          data.flatMap((item) => Object.keys(item))
        )
    );
      let columns = [...dynamicColumns];
      
      let currentY = 20;
      // console.log(data);

        
        

        const rows = data.map(item =>
          columns.map(column => {
            const value = item[column];
            return value || value === 0 ? fixEn(value, column) : '';
          }).reverse()
        );


        doc.autoTable({
          head: [columns.map(column => isEn(column) ? columsMapping[column] : column).reverse()],
          body: rows,
          startY: currentY,
          styles: {
            font: 'ArialHebrew',
            fontSize: 9,
            cellPadding: 1,
            halign: 'right',
            overflow: 'linebreak',
          },
          headStyles: {
            fillColor: [200, 200, 200],
            textColor: [0, 0, 0],
          },
          
          didDrawPage: function(data) {
              // Set font for page number
              doc.setFont('ArialHebrew');
              doc.setFontSize(12);
              const pageWidth = doc.internal.pageSize.getWidth();

              doc.text(`בס"ד`, pageWidth - 20, 10, { align: 'right' , dir: 'rtl' });

    
          
              // Add page number to all pages
              doc.text(
                `דף ${fixEn(data.pageNumber, 'pageCount')}`, 
                doc.internal.pageSize.getWidth() - 30, 
                doc.internal.pageSize.getHeight() - 10
              );
            
          }
          
        });

     

      if (preview) {
        // Generate a Blob and create an object URL for preview
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
  
        // Open the preview in a new tab or iframe
        window.open(pdfUrl, '_blank'); // New tab preview
      } else {
        // Save the PDF
        doc.save(`${fileName}.pdf`);
      }
  
    } catch (error) {
      console.error(error);
    }
  };




















