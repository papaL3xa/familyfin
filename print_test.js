const printContent = (elementId) => {
  const content = document.getElementById(elementId).innerHTML;
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(
      <html>
        <head>
          <style>
            @page { margin: 0; size: 58mm auto; }
            body { font-family: monospace; margin: 0; padding: 0; width: 58mm; color: black; }
          </style>
        </head>
        <body></body>
      </html>
    );
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
};
