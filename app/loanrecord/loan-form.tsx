"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./loanform.module.css";

type ExpenseRecordType = {
  id: string;
  type: "loan" | "expense";
  recipient_name: string;
  mobile_no: string;
  total_amount: number;
  purpose: string;
  category: string;
  payment_method: string;
  remarks?: string;
  expense_date: string;
  created_at: string;
  
  // Loan specific fields
  loan_type?: "installment" | "one_time";
  return_date?: string;
  interest_rate?: number;
  installment_amount?: number;
  total_installments?: number;
  remaining_amount?: number;
  collateral?: string;
};

type LoanReturnType = {
  id: string;
  loan_id: string;
  return_date: string;
  return_amount: number;
  remaining_after_return: number;
  payment_method?: string;
  remarks?: string;
  created_at: string;
  created_by?: string;
};

export default function LoanForm() {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<ExpenseRecordType[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ExpenseRecordType[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ExpenseRecordType | null>(null);
  const [loanReturns, setLoanReturns] = useState<LoanReturnType[]>([]);
  const [viewMode, setViewMode] = useState<"all" | "loan" | "expense">("all");
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"records" | "details">("records");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedLoanForReturn, setSelectedLoanForReturn] = useState<ExpenseRecordType | null>(null);
  const [returnData, setReturnData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    payment_method: "",
    remarks: ""
  });
  const [processingReturn, setProcessingReturn] = useState(false);
  const [downloadingDoc, setDownloadingDoc] = useState(false);

  const paymentMethods = [
    "Cash",
    "Easypaisa",
    "JazzCash",
    "Bank Transfer",
    "Cheque",
    "Other"
  ];

  // Fetch all records
  useEffect(() => {
    fetchRecords();
  }, [viewMode]);

  // Filter records based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRecords(records);
    } else {
      const filtered = records.filter(
        (record) =>
          record.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (record.mobile_no && record.mobile_no.includes(searchTerm)) ||
          record.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecords(filtered);
    }
  }, [searchTerm, records]);

  async function fetchRecords() {
    try {
      setLoading(true);
      setErrorMessage(null);
      
      let query = supabase
        .from("expense_records")
        .select("*")
        .order("created_at", { ascending: false });

      if (viewMode !== "all") {
        query = query.eq("type", viewMode);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      setRecords(data || []);
      setFilteredRecords(data || []);
    } catch (error: any) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecordDetails(recordId: string, mobile_no: string) {
    try {
      setDetailsLoading(true);
      
      // Get the specific record
      const { data: recordData, error: recordError } = await supabase
        .from("expense_records")
        .select("*")
        .eq("id", recordId)
        .single();

      if (recordError) throw recordError;
      
      // Get all records with same mobile number
      const { data: allRecords, error: allError } = await supabase
        .from("expense_records")
        .select("*")
        .eq("mobile_no", mobile_no)
        .order("expense_date", { ascending: false });

      if (allError) throw allError;
      
      // Fetch loan returns for this loan if it's a loan
      let returnsData: LoanReturnType[] = [];
      if (recordData.type === "loan") {
        const { data: returns, error: returnsError } = await supabase
          .from("loan_returns")
          .select("*")
          .eq("loan_id", recordId)
          .order("return_date", { ascending: false });
        
        if (!returnsError) {
          returnsData = returns || [];
        }
      }
      
      setSelectedRecord(recordData);
      setRecords(allRecords || []);
      setLoanReturns(returnsData);
      setActiveTab("details");
    } catch (error: any) {
      console.error("Error fetching record details:", error);
      setErrorMessage(`Failed to load details: ${error.message}`);
    } finally {
      setDetailsLoading(false);
    }
  }

  // Handle Return Loan Button Click
  const handleReturnLoan = (loan: ExpenseRecordType) => {
    setSelectedLoanForReturn(loan);
    setReturnData({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      payment_method: loan.payment_method || "",
      remarks: ""
    });
    setShowReturnModal(true);
  };

  // Process Loan Return
  const processLoanReturn = async () => {
    if (!selectedLoanForReturn || !returnData.amount) return;
    
    const amount = parseFloat(returnData.amount);
    const currentRemaining = selectedLoanForReturn.remaining_amount || selectedLoanForReturn.total_amount;
    
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage("Please enter a valid amount");
      return;
    }
    
    if (amount > currentRemaining) {
      setErrorMessage("Return amount cannot exceed remaining amount");
      return;
    }

    setProcessingReturn(true);
    
    try {
      const newRemaining = currentRemaining - amount;
      
      // Start a transaction (Supabase doesn't have transactions in client, so we'll do sequentially)
      // 1. Update the loan's remaining amount
      const { error: updateError } = await supabase
        .from("expense_records")
        .update({ 
          remaining_amount: newRemaining
        })
        .eq("id", selectedLoanForReturn.id);

      if (updateError) throw updateError;

      // 2. Record the return in loan_returns table
      const { error: returnError } = await supabase
        .from("loan_returns")
        .insert([{
          loan_id: selectedLoanForReturn.id,
          return_date: returnData.date,
          return_amount: amount,
          remaining_after_return: newRemaining,
          payment_method: returnData.payment_method,
          remarks: returnData.remarks
        }]);

      if (returnError) throw returnError;

      // Refresh all data
      await fetchRecords();
      
      // If we're viewing details, refresh that too
      if (selectedRecord?.id === selectedLoanForReturn.id) {
        await fetchRecordDetails(selectedLoanForReturn.id, selectedLoanForReturn.mobile_no);
      }

      setShowReturnModal(false);
      setSelectedLoanForReturn(null);
      setReturnData({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        payment_method: "",
        remarks: ""
      });
      setErrorMessage(null);
      
      // Show success message
      alert(`✅ Successfully recorded return of Rs ${amount.toLocaleString()} on ${new Date(returnData.date).toLocaleDateString()}. Remaining amount: Rs ${newRemaining.toLocaleString()}`);
      
    } catch (error: any) {
      console.error("Error processing return:", error);
      setErrorMessage(`Failed to process return: ${error.message}`);
    } finally {
      setProcessingReturn(false);
    }
  };

  // Generate and download loan details document
  const downloadLoanDetails = async (loan: ExpenseRecordType) => {
    try {
      setDownloadingDoc(true);
      
      // Fetch loan returns if not already loaded
      let returnsData: LoanReturnType[] = [];
      if (!loanReturns.some(r => r.loan_id === loan.id)) {
        const { data: returns, error } = await supabase
          .from("loan_returns")
          .select("*")
          .eq("loan_id", loan.id)
          .order("return_date", { ascending: true });
        
        if (!error) {
          returnsData = returns || [];
        }
      } else {
        returnsData = loanReturns.filter(r => r.loan_id === loan.id);
      }
      
      const totalReturned = returnsData.reduce((sum, r) => sum + r.return_amount, 0);
      const remainingAmount = loan.remaining_amount || loan.total_amount;
      const actualRemaining = remainingAmount - totalReturned;
      const isCompleted = actualRemaining <= 0;
      
      // Create HTML content for the document
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Loan Details - ${loan.recipient_name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2c3e50;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2c3e50;
              margin: 0;
            }
            .header .subtitle {
              color: #7f8c8d;
              font-size: 14px;
            }
            .status-badge {
              display: inline-block;
              padding: 5px 15px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 14px;
              margin-left: 10px;
            }
            .status-completed {
              background-color: #d4edda;
              color: #155724;
            }
            .status-active {
              background-color: #fff3cd;
              color: #856404;
            }
            .status-overdue {
              background-color: #f8d7da;
              color: #721c24;
            }
            .section {
              margin-bottom: 30px;
              padding: 20px;
              border: 1px solid #dee2e6;
              border-radius: 8px;
            }
            .section-title {
              color: #2c3e50;
              border-bottom: 2px solid #3498db;
              padding-bottom: 10px;
              margin-top: 0;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              color: #495057;
              font-size: 14px;
              margin-bottom: 5px;
            }
            .info-value {
              font-size: 15px;
            }
            .summary-box {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .summary-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 1px dashed #dee2e6;
            }
            .summary-label {
              font-weight: bold;
            }
            .summary-value {
              font-weight: bold;
            }
            .summary-total {
              font-size: 18px;
              color: #27ae60;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th {
              background-color: #f8f9fa;
              text-align: left;
              padding: 12px;
              border-bottom: 2px solid #dee2e6;
              font-weight: bold;
              color: #495057;
            }
            td {
              padding: 10px 12px;
              border-bottom: 1px solid #dee2e6;
            }
            tr:hover {
              background-color: #f8f9fa;
            }
            .amount {
              font-weight: bold;
            }
            .positive {
              color: #27ae60;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #dee2e6;
              font-size: 12px;
              color: #7f8c8d;
              text-align: center;
            }
            .generated-date {
              font-style: italic;
            }
            .print-button {
              display: none;
            }
            @media print {
              body {
                padding: 0;
              }
              .print-button {
                display: none;
              }
            }
              .footer-simple {
  margin-top: 25px;
  font-size: 11px;
  color: #6c757d;
  text-align: center;
  padding: 10px;
  border-top: 1px dotted #ccc;
}

.footer-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.footer-line strong {
  color: #2c3e50;
  font-weight: 600;
}

.system-generated {
  display: flex;
  align-items: center;
  gap: 5px;
  font-style: italic;
  color: #3498db;
}
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Sahara foundation Payment Record</h1>
            <div class="subtitle">Sahara Foundation Finance Record System</div>
            <div class="subtitle">Generated on: ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Loan Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Borrower Name:</div>
                <div class="info-value">${loan.recipient_name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Contact Number:</div>
                <div class="info-value">${loan.mobile_no || "Not Provided"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Loan Date:</div>
                <div class="info-value">${new Date(loan.expense_date).toLocaleDateString()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Loan Type:</div>
                <div class="info-value">${loan.loan_type || "Not Specified"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Purpose:</div>
                <div class="info-value">${loan.purpose}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Category:</div>
                <div class="info-value">${loan.category}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Payment Method:</div>
                <div class="info-value">${loan.payment_method}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Interest Rate:</div>
                <div class="info-value">${loan.interest_rate || 0}%</div>
              </div>
              <div class="info-item">
                <div class="info-label">Expected Return Date:</div>
                <div class="info-value">${loan.return_date ? new Date(loan.return_date).toLocaleDateString() : "Not Specified"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Collateral:</div>
                <div class="info-value">${loan.collateral || "None"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Remarks:</div>
                <div class="info-value">${loan.remarks || "None"}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Financial Summary</h2>
            <div class="summary-box">
              <div class="summary-item">
                <span class="summary-label">Original Loan Amount:</span>
                <span class="summary-value">Rs ${loan.total_amount.toLocaleString()}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Total Returned:</span>
                <span class="summary-value positive">Rs ${totalReturned.toLocaleString()}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Remaining Amount:</span>
                <span class="summary-value ${actualRemaining > 0 ? '' : 'positive'}">Rs ${actualRemaining.toLocaleString()}</span>
              </div>
              <div class="summary-item summary-total">
                <span class="summary-label">Loan Status:</span>
                <span class="summary-value">
                  ${isCompleted ? '✅ COMPLETED' : actualRemaining > 0 ? '🔄 ACTIVE' : '✅ COMPLETED'}
                  <span class="status-badge ${isCompleted ? 'status-completed' : actualRemaining > 0 ? 'status-active' : 'status-completed'}">
                    ${isCompleted ? 'PAID IN FULL' : actualRemaining > 0 ? 'ACTIVE' : 'PAID IN FULL'}
                  </span>
                </span>
              </div>
            </div>
          </div>
          
          ${returnsData.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Payment History</h2>
            <table>
              <thead>
                <tr>
                  <th>Payment Date</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Remaining After Payment</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${returnsData.map(returnRecord => `
                <tr>
                  <td>${new Date(returnRecord.return_date).toLocaleDateString()}</td>
                  <td class="amount positive">Rs ${returnRecord.return_amount.toLocaleString()}</td>
                  <td>${returnRecord.payment_method || "Not Specified"}</td>
                  <td class="amount">Rs ${returnRecord.remaining_after_return.toLocaleString()}</td>
                  <td>${returnRecord.remarks || "-"}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          <div class="section">
            <h2 class="section-title">Terms & Conditions</h2>
            <div style="font-size: 13px; line-height: 1.5;">
              <p>1. This document serves as a record of loan agreement and payments between the foundation and the borrower.</p>
              <p>2. All payments have been recorded in the foundation's official records.</p>
              <p>3. The borrower acknowledges receipt of the loan amount and agrees to the repayment terms.</p>
              <p>4. Any disputes regarding this loan should be brought to the foundation's attention within 30 days.</p>
              <p>5. This document is generated from the  sahara Foundation Finance Record System and is considered an official record.</p>
            </div>
          </div>
          
         <div class="footer-simple">
  <div class="footer-line">
    Authorized: <strong>Ahmad Mukhtar Shahi</strong> | 
    <span class="system-generated">CEO Sahara</span>
  </div>
</div>
          
          <div class="print-button" onclick="window.print()">
            Print Document
          </div>
          
          <script>
            // Auto-print after loading (optional)
            // window.onload = function() {
            //   window.print();
            // }
          </script>
        </body>
        </html>
      `;
      
      // Create a Blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Loan_Details_${loan.recipient_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error("Error generating document:", error);
      setErrorMessage("Failed to generate document. Please try again.");
    } finally {
      setDownloadingDoc(false);
    }
  };

  // Calculate total returned amount
  const calculateTotalReturned = (loanId: string) => {
    return loanReturns
      .filter(returnRecord => returnRecord.loan_id === loanId)
      .reduce((sum, returnRecord) => sum + returnRecord.return_amount, 0);
  };

  // Check if loan is fully paid/completed
  const isLoanCompleted = (loan: ExpenseRecordType) => {
    const totalReturned = calculateTotalReturned(loan.id);
    const remainingAmount = loan.remaining_amount || loan.total_amount;
    const actualRemaining = remainingAmount - totalReturned;
    return actualRemaining <= 0;
  };

  // Get remaining amount after returns
  const getActualRemaining = (loan: ExpenseRecordType) => {
    const totalReturned = calculateTotalReturned(loan.id);
    const remainingAmount = loan.remaining_amount || loan.total_amount;
    return remainingAmount - totalReturned;
  };

  // Group records by mobile number
  const groupedByMobile = records.reduce((groups, record) => {
    const mobileKey = record.mobile_no ? record.mobile_no.trim() : "no-number";
    
    if (!groups[mobileKey]) {
      groups[mobileKey] = {
        mobile_no: record.mobile_no || "No Number",
        name: record.recipient_name,
        records: [],
        totalAmount: 0,
        totalLoans: 0,
        totalExpenses: 0,
        lastTransaction: "",
        loanTypes: new Set<string>(),
        categories: new Set<string>()
      };
    }
    
    groups[mobileKey].records.push(record);
    groups[mobileKey].totalAmount += record.total_amount;
    
    if (record.type === "loan") {
      groups[mobileKey].totalLoans += 1;
      if (record.category) {
        groups[mobileKey].loanTypes.add(record.category);
      }
    } else {
      groups[mobileKey].totalExpenses += 1;
      if (record.category) {
        groups[mobileKey].categories.add(record.category);
      }
    }
    
    // Find the most recent transaction date
    const currentDate = new Date(record.expense_date);
    if (!groups[mobileKey].lastTransaction || currentDate > new Date(groups[mobileKey].lastTransaction)) {
      groups[mobileKey].lastTransaction = record.expense_date;
    }
    
    return groups;
  }, {} as Record<string, {
    mobile_no: string;
    name: string;
    records: ExpenseRecordType[];
    totalAmount: number;
    totalLoans: number;
    totalExpenses: number;
    lastTransaction: string;
    loanTypes: Set<string>;
    categories: Set<string>;
  }>);

  const groupedByMobileArray = Object.values(groupedByMobile);

  // Format currency
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Format date
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Get type color
  function getTypeColor(type: string) {
    return type === "loan" ? "#2ecc71" : "#3498db";
  }

  // Get loan status (for display only)
  function getLoanStatus(record: ExpenseRecordType): string {
    if (record.type !== "loan") return "expense";
    
    const actualRemaining = getActualRemaining(record);
    
    if (actualRemaining <= 0) {
      return "completed";
    } else if (record.return_date && new Date(record.return_date) < new Date()) {
      return "overdue";
    } else if (record.loan_type === "installment") {
      return "active-installment";
    } else if (record.loan_type === "one_time") {
      return "active-one-time";
    } else {
      return "active";
    }
  }

  // Check if loan can be returned
  function canReturnLoan(record: ExpenseRecordType): boolean {
    if (record.type !== "loan") return false;
    return !isLoanCompleted(record);
  }

  // Get status color
  function getStatusColor(status: string) {
    switch(status) {
      case "completed": return "#3498db";
      case "overdue": return "#e74c3c";
      case "active-installment": return "#2ecc71";
      case "active-one-time": return "#f39c12";
      case "active": return "#2ecc71";
      default: return "#95a5a6";
    }
  }

  // Calculate statistics for selected record
  const allRecordsForMobile = selectedRecord 
    ? records.filter(r => r.mobile_no === selectedRecord.mobile_no)
    : [];
  
  const totalRecords = allRecordsForMobile.length;
  const totalAmount = allRecordsForMobile.reduce((sum, r) => sum + r.total_amount, 0);
  const loanRecords = allRecordsForMobile.filter(r => r.type === "loan");
  const expenseRecords = allRecordsForMobile.filter(r => r.type === "expense");

  // Calculate loan statistics
  const activeLoans = loanRecords.filter(r => !isLoanCompleted(r)).length;
  const completedLoans = loanRecords.filter(r => isLoanCompleted(r)).length;
  const overdueLoans = loanRecords.filter(r => {
    const actualRemaining = getActualRemaining(r);
    return actualRemaining > 0 && r.return_date && new Date(r.return_date) < new Date();
  }).length;

  // Get returns for selected loan
  const selectedLoanReturns = selectedRecord 
    ? loanReturns.filter(r => r.loan_id === selectedRecord.id)
    : [];

  // Calculate totals for selected loan
  const selectedLoanTotalReturned = selectedLoanReturns.reduce((sum, r) => sum + r.return_amount, 0);
  const selectedLoanRemaining = selectedRecord ? getActualRemaining(selectedRecord) : 0;
  const selectedLoanCompleted = selectedRecord ? isLoanCompleted(selectedRecord) : false;

  // Inline styles
  const stylesObj = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: "2rem 1rem",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    wrapper: {
      maxWidth: "1400px",
      margin: "0 auto",
    },
    header: {
      textAlign: "center" as const,
      marginBottom: "2.5rem",
    },
    headerTitle: {
      fontSize: "2.8rem",
      fontWeight: "800",
      color: "#2c3e50",
      marginBottom: "0.5rem",
      textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
    },
    headerSubtitle: {
      fontSize: "1.1rem",
      color: "#7f8c8d",
      maxWidth: "600px",
      margin: "0 auto",
    },
    card: {
      background: "white",
      borderRadius: "15px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      overflow: "hidden",
    },
    searchSection: {
      background: "linear-gradient(90deg, #2c3e50 0%, #4a6491 100%)",
      padding: "1.5rem 2rem",
    },
    searchContainer: {
      maxWidth: "800px",
      margin: "0 auto",
    },
    searchLabel: {
      display: "block",
      color: "white",
      fontSize: "1rem",
      fontWeight: "600",
      marginBottom: "0.5rem",
    },
    searchInput: {
      width: "100%",
      padding: "0.875rem 1rem",
      borderRadius: "10px",
      border: "none",
      fontSize: "1rem",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      outline: "none",
      transition: "all 0.3s ease",
    },
    searchInputFocus: {
      boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
    },
    filtersSection: {
      padding: "1rem 2rem",
      background: "#f8f9fa",
      borderBottom: "1px solid #dee2e6",
    },
    filterButtons: {
      display: "flex",
      gap: "1rem",
      justifyContent: "center",
    },
    filterButton: {
      padding: "0.75rem 1.5rem",
      borderRadius: "8px",
      border: "2px solid #dee2e6",
      background: "white",
      color: "#6c757d",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    filterButtonActive: {
      background: "linear-gradient(90deg, #2c3e50 0%, #4a6491 100%)",
      color: "white",
      borderColor: "#2c3e50",
    },
    mainContent: {
      padding: "2rem",
    },
    tabs: {
      display: "flex",
      gap: "1rem",
      marginBottom: "1.5rem",
      borderBottom: "2px solid #dee2e6",
      paddingBottom: "0.5rem",
    },
    tab: {
      padding: "0.75rem 1.5rem",
      border: "none",
      background: "none",
      fontSize: "0.95rem",
      fontWeight: "600",
      cursor: "pointer",
      color: "#6c757d",
      position: "relative" as const,
    },
    tabActive: {
      color: "#2c3e50",
    },
    tabIndicator: {
      position: "absolute" as const,
      bottom: "-0.5rem",
      left: 0,
      right: 0,
      height: "3px",
      background: "#2c3e50",
      borderRadius: "3px",
    },
    backButton: {
      background: "#95a5a6",
      color: "white",
      padding: "0.75rem 1.5rem",
      borderRadius: "8px",
      border: "none",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginBottom: "1.5rem",
    },
    backButtonHover: {
      background: "#7f8c8d",
    },
    loadingContainer: {
      textAlign: "center" as const,
      padding: "3rem",
      color: "#7f8c8d",
    },
    tableContainer: {
      overflowX: "auto" as const,
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
    },
    tableHeader: {
      background: "#f8f9fa",
      borderBottom: "2px solid #dee2e6",
    },
    tableHeaderCell: {
      padding: "1rem",
      textAlign: "left" as const,
      fontWeight: "600",
      color: "#495057",
      fontSize: "0.9rem",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
    },
    tableRow: {
      borderBottom: "1px solid #dee2e6",
      transition: "all 0.2s ease",
    },
    tableRowHover: {
      background: "#f8f9fa",
      cursor: "pointer",
    },
    tableCell: {
      padding: "1rem",
      color: "#495057",
      fontSize: "0.95rem",
    },
    amountCell: {
      fontWeight: "600",
      color: "#27ae60",
    },
    dateCell: {
      color: "#6c757d",
      fontSize: "0.85rem",
    },
    noData: {
      textAlign: "center" as const,
      padding: "3rem",
      color: "#6c757d",
      fontSize: "1.1rem",
    },
    detailsCard: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "12px",
      padding: "1.5rem",
      marginBottom: "1.5rem",
      color: "white",
    },
    detailsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1rem",
    },
    detailsItem: {
      marginBottom: "0.5rem",
    },
    detailsLabel: {
      fontSize: "0.85rem",
      opacity: "0.9",
      marginBottom: "0.25rem",
    },
    detailsValue: {
      fontSize: "1.1rem",
      fontWeight: "600",
    },
    statsCard: {
      background: "#f8f9fa",
      borderRadius: "10px",
      padding: "1rem",
      marginTop: "1rem",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "1rem",
      textAlign: "center" as const,
    },
    statItem: {
      padding: "0.75rem",
    },
    statValue: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#2c3e50",
    },
    statLabel: {
      fontSize: "0.85rem",
      color: "#7f8c8d",
      marginTop: "0.25rem",
    },
    statusBadge: {
      display: "inline-block",
      padding: "0.25rem 0.75rem",
      borderRadius: "50px",
      fontSize: "0.75rem",
      fontWeight: "600",
      textTransform: "uppercase" as const,
    },
    typeBadge: {
      display: "inline-block",
      padding: "0.25rem 0.75rem",
      borderRadius: "50px",
      fontSize: "0.75rem",
      fontWeight: "600",
      textTransform: "uppercase" as const,
    },
    mobileBadge: {
      display: "inline-block",
      padding: "0.25rem 0.5rem",
      borderRadius: "4px",
      background: "#fff3cd",
      color: "#856404",
      fontSize: "0.75rem",
      fontWeight: "600",
      marginLeft: "0.5rem",
    },
    errorMessage: {
      background: "#f8d7da",
      color: "#721c24",
      padding: "1rem",
      borderRadius: "8px",
      marginBottom: "1rem",
      border: "1px solid #f5c6cb",
    },
    returnButton: {
      background: "#27ae60",
      color: "white",
      border: "none",
      padding: "0.5rem 1rem",
      borderRadius: "6px",
      fontSize: "0.85rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginRight: "0.5rem",
    },
    returnButtonHover: {
      background: "#219653",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 6px rgba(33, 150, 83, 0.3)",
    },
    downloadButton: {
      background: "#3498db",
      color: "white",
      border: "none",
      padding: "0.5rem 1rem",
      borderRadius: "6px",
      fontSize: "0.85rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    downloadButtonHover: {
      background: "#2980b9",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 6px rgba(52, 152, 219, 0.3)",
    },
    completedBadge: {
      display: "inline-block",
      padding: "0.5rem 1rem",
      borderRadius: "6px",
      background: "#d4edda",
      color: "#155724",
      fontSize: "0.85rem",
      fontWeight: "600",
      marginLeft: "0.5rem",
    },
    modalOverlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modal: {
      background: "white",
      borderRadius: "20px",
      padding: "3rem 2rem",
      maxWidth: "550px",
      width: "90%",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      textAlign: "center" as const,
      animation: "modalSlideIn 0.4s ease-out",
    },
    modalTitle: {
      fontSize: "1.8rem",
      fontWeight: "700",
      marginBottom: "1.5rem",
      color: "#2c3e50",
      letterSpacing: "0.5px",
    },
    modalInput: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "6px",
      border: "2px solid #dee2e6",
      fontSize: "1rem",
      marginBottom: "1rem",
    },
    modalSelect: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "6px",
      border: "2px solid #dee2e6",
      fontSize: "1rem",
      marginBottom: "1rem",
      background: "white",
    },
    modalTextarea: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "6px",
      border: "2px solid #dee2e6",
      fontSize: "1rem",
      marginBottom: "1rem",
      minHeight: "80px",
      fontFamily: "inherit",
    },
    modalButtons: {
      display: "flex",
      gap: "1rem",
      justifyContent: "flex-end",
    },
    modalButton: {
      padding: "0.75rem 1.5rem",
      borderRadius: "6px",
      border: "none",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    modalCancelButton: {
      background: "#95a5a6",
      color: "white",
    },
    modalConfirmButton: {
      background: "#27ae60",
      color: "white",
    },
    modalCancelButtonHover: {
      background: "#7f8c8d",
    },
    modalConfirmButtonHover: {
      background: "#219653",
    },
    returnsTable: {
      marginTop: "2rem",
    },
    returnsHeader: {
      fontSize: "1.2rem",
      fontWeight: "600",
      color: "#2c3e50",
      marginBottom: "1rem",
    },
    actionButtons: {
      display: "flex",
      gap: "0.5rem",
      alignItems: "center",
    },
  };

  return (
    <div style={stylesObj.container}>
      <div style={stylesObj.wrapper}>
        {/* Header */}
        <div style={stylesObj.header}>
          <h1 style={stylesObj.headerTitle}>LOAN & EXPENSE RECORDS</h1>
          <p style={stylesObj.headerSubtitle}>
            Track all loans and expenses by contact number with complete history
          </p>
        </div>

        {/* Main Card */}
        <div style={stylesObj.card}>
          {/* Search Section */}
          <div style={stylesObj.searchSection}>
            <div style={stylesObj.searchContainer}>
              <label style={stylesObj.searchLabel}>
                🔍 SEARCH BY NAME, NUMBER, OR PURPOSE
              </label>
              <input
                type="text"
                placeholder="Search recipient, mobile number, category, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={stylesObj.searchInput}
                onFocus={(e) => Object.assign((e.target as HTMLInputElement).style, stylesObj.searchInputFocus)}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                }}
              />
            </div>
          </div>

          {/* Filter Section */}
          <div style={stylesObj.filtersSection}>
            <div style={stylesObj.filterButtons}>
              <button
                style={{
                  ...stylesObj.filterButton,
                  ...(viewMode === "all" ? stylesObj.filterButtonActive : {}),
                }}
                onClick={() => setViewMode("all")}
              >
                📊 All Records
              </button>
              <button
                style={{
                  ...stylesObj.filterButton,
                  ...(viewMode === "loan" ? stylesObj.filterButtonActive : {}),
                }}
                onClick={() => setViewMode("loan")}
              >
                💰 Loans Only
              </button>
              <button
                style={{
                  ...stylesObj.filterButton,
                  ...(viewMode === "expense" ? stylesObj.filterButtonActive : {}),
                }}
                onClick={() => setViewMode("expense")}
              >
                💵 Expenses Only
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div style={stylesObj.mainContent}>
            {/* Error Message */}
            {errorMessage && (
              <div style={stylesObj.errorMessage}>
                ⚠️ {errorMessage}
                <button 
                  onClick={() => setErrorMessage(null)}
                  style={{
                    marginLeft: "1rem",
                    background: "transparent",
                    border: "none",
                    color: "#721c24",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Tabs */}
            <div style={stylesObj.tabs}>
              <button
                style={{
                  ...stylesObj.tab,
                  ...(activeTab === "records" ? stylesObj.tabActive : {}),
                }}
                onClick={() => setActiveTab("records")}
              >
                {activeTab === "records" && <span style={stylesObj.tabIndicator} />}
                📋 All Records
              </button>
              {selectedRecord && (
                <button
                  style={{
                    ...stylesObj.tab,
                    ...(activeTab === "details" ? stylesObj.tabActive : {}),
                  }}
                  onClick={() => setActiveTab("details")}
                >
                  {activeTab === "details" && <span style={stylesObj.tabIndicator} />}
                  👤 {selectedRecord.recipient_name}'s Details
                </button>
              )}
            </div>

            {/* Back Button (when viewing details) */}
            {activeTab === "details" && selectedRecord && (
              <button
                style={stylesObj.backButton}
                onClick={() => {
                  setActiveTab("records");
                  setSelectedRecord(null);
                  setLoanReturns([]);
                }}
                onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, stylesObj.backButtonHover)}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#95a5a6";
                }}
              >
                ← Back to All Records
              </button>
            )}

            {/* Loading State */}
            {loading && activeTab === "records" && (
              <div style={stylesObj.loadingContainer}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
                <p>Loading records...</p>
              </div>
            )}

            {detailsLoading && activeTab === "details" && (
              <div style={stylesObj.loadingContainer}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
                <p>Loading details...</p>
              </div>
            )}

            {/* Records List */}
            {!loading && activeTab === "records" && (
              <div style={stylesObj.tableContainer}>
                {groupedByMobileArray.length > 0 ? (
                  <table style={stylesObj.table}>
                    <thead style={stylesObj.tableHeader}>
                      <tr>
                        <th style={stylesObj.tableHeaderCell}>Contact Number</th>
                        <th style={stylesObj.tableHeaderCell}>Name</th>
                        <th style={stylesObj.tableHeaderCell}>Total Amount</th>
                        <th style={stylesObj.tableHeaderCell}>Loans/Expenses</th>
                        <th style={stylesObj.tableHeaderCell}>Categories</th>
                        <th style={stylesObj.tableHeaderCell}>Last Transaction</th>
                        <th style={stylesObj.tableHeaderCell}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedByMobileArray.map((group, index) => (
                        <tr
                          key={`${group.mobile_no}_${index}`}
                          style={stylesObj.tableRow}
                          onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLTableRowElement).style, stylesObj.tableRowHover)}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLTableRowElement).style.background = "";
                          }}
                        >
                          <td style={stylesObj.tableCell}>
                            <div style={{ fontWeight: "600", color: "#2c3e50" }}>
                              {group.mobile_no}
                              <span style={stylesObj.mobileBadge}>
                                {group.records.length} records
                              </span>
                            </div>
                          </td>
                          <td style={stylesObj.tableCell}>
                            <div style={{ fontWeight: "600" }}>
                              {group.name}
                            </div>
                          </td>
                          <td style={{ ...stylesObj.tableCell, ...stylesObj.amountCell }}>
                            {formatCurrency(group.totalAmount)}
                          </td>
                          <td style={stylesObj.tableCell}>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                              {group.totalLoans > 0 && (
                                <span
                                  style={{
                                    ...stylesObj.typeBadge,
                                    background: "#d4edda",
                                    color: "#155724",
                                  }}
                                >
                                  💰 {group.totalLoans} loan{group.totalLoans > 1 ? 's' : ''}
                                </span>
                              )}
                              {group.totalExpenses > 0 && (
                                <span
                                  style={{
                                    ...stylesObj.typeBadge,
                                    background: "#d1ecf1",
                                    color: "#0c5460",
                                  }}
                                >
                                  💵 {group.totalExpenses} expense{group.totalExpenses > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={stylesObj.tableCell}>
                            <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                              {Array.from(group.loanTypes).map((type, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    ...stylesObj.typeBadge,
                                    background: "#fff3cd",
                                    color: "#856404",
                                    fontSize: "0.7rem",
                                  }}
                                >
                                  {type}
                                </span>
                              ))}
                              {Array.from(group.categories).map((category, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    ...stylesObj.typeBadge,
                                    background: "#e2e3e5",
                                    color: "#383d41",
                                    fontSize: "0.7rem",
                                  }}
                                >
                                  {category}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ ...stylesObj.tableCell, ...stylesObj.dateCell }}>
                            {formatDate(group.lastTransaction)}
                          </td>
                          <td style={stylesObj.tableCell}>
                            <button
                              onClick={() => {
                                const firstRecord = group.records[0];
                                fetchRecordDetails(firstRecord.id, firstRecord.mobile_no);
                              }}
                              style={{
                                padding: "0.5rem 1rem",
                                background: "linear-gradient(90deg, #2c3e50 0%, #4a6491 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 6px rgba(44, 62, 80, 0.3)";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                              }}
                            >
                              View All Transactions
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={stylesObj.noData}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                      {viewMode === "loan" ? "💰" : viewMode === "expense" ? "💵" : "📭"}
                    </div>
                    <p>No records found</p>
                    <button
                      onClick={() => fetchRecords()}
                      style={{
                        marginTop: "1rem",
                        padding: "0.5rem 1rem",
                        background: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      ↻ Refresh Data
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Details View */}
            {!detailsLoading && activeTab === "details" && selectedRecord && (
              <>
                {/* Person Summary Card */}
                <div style={stylesObj.detailsCard}>
                  <div style={stylesObj.detailsGrid}>
                    <div style={stylesObj.detailsItem}>
                      <div style={stylesObj.detailsLabel}>CONTACT NUMBER</div>
                      <div style={stylesObj.detailsValue}>
                        {selectedRecord.mobile_no || "Not Provided"}
                        <span style={{
                          ...stylesObj.statusBadge,
                          background: "rgba(255,255,255,0.2)",
                          color: "white",
                          marginLeft: "0.5rem",
                        }}>
                          {totalRecords} total records
                        </span>
                      </div>
                    </div>
                    <div style={stylesObj.detailsItem}>
                      <div style={stylesObj.detailsLabel}>PRIMARY NAME</div>
                      <div style={stylesObj.detailsValue}>{selectedRecord.recipient_name}</div>
                    </div>
                    <div style={stylesObj.detailsItem}>
                      <div style={stylesObj.detailsLabel}>TOTAL TRANSACTIONS</div>
                      <div style={stylesObj.detailsValue}>{formatCurrency(totalAmount)}</div>
                    </div>
                    <div style={stylesObj.detailsItem}>
                      <div style={stylesObj.detailsLabel}>LAST TRANSACTION</div>
                      <div style={stylesObj.detailsValue}>
                        {allRecordsForMobile.length > 0 
                          ? formatDate(allRecordsForMobile[0].expense_date)
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                  <div style={stylesObj.statsCard}>
                    <div style={stylesObj.statsGrid}>
                      <div style={stylesObj.statItem}>
                        <div style={stylesObj.statValue}>{loanRecords.length}</div>
                        <div style={stylesObj.statLabel}>Total Loans</div>
                      </div>
                      <div style={stylesObj.statItem}>
                        <div style={stylesObj.statValue}>{expenseRecords.length}</div>
                        <div style={stylesObj.statLabel}>Total Expenses</div>
                      </div>
                      <div style={stylesObj.statItem}>
                        <div style={stylesObj.statValue}>{activeLoans}</div>
                        <div style={stylesObj.statLabel}>Active Loans</div>
                      </div>
                      <div style={stylesObj.statItem}>
                        <div style={stylesObj.statValue}>{completedLoans}</div>
                        <div style={stylesObj.statLabel}>Completed Loans</div>
                      </div>
                      {overdueLoans > 0 && (
                        <div style={stylesObj.statItem}>
                          <div style={{...stylesObj.statValue, color: "#e74c3c"}}>{overdueLoans}</div>
                          <div style={stylesObj.statLabel}>Overdue Loans</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* All Transactions Table */}
                <div style={stylesObj.tableContainer}>
                  <h3 style={{ marginBottom: "1rem", color: "#2c3e50" }}>
                    📊 All Transactions for {selectedRecord.mobile_no || selectedRecord.recipient_name}
                  </h3>
                  <table style={stylesObj.table}>
                    <thead style={stylesObj.tableHeader}>
                      <tr>
                        <th style={stylesObj.tableHeaderCell}>Date</th>
                        <th style={stylesObj.tableHeaderCell}>Type</th>
                        <th style={stylesObj.tableHeaderCell}>Name</th>
                        <th style={stylesObj.tableHeaderCell}>Amount</th>
                        <th style={stylesObj.tableHeaderCell}>Category</th>
                        <th style={stylesObj.tableHeaderCell}>Purpose</th>
                        <th style={stylesObj.tableHeaderCell}>Status</th>
                        <th style={stylesObj.tableHeaderCell}>Payment Method</th>
                        <th style={stylesObj.tableHeaderCell}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allRecordsForMobile.map((record) => {
                        const status = getLoanStatus(record);
                        const canReturn = canReturnLoan(record);
                        const completed = isLoanCompleted(record);
                        const actualRemaining = getActualRemaining(record);
                        const totalReturned = calculateTotalReturned(record.id);
                        
                        return (
                          <tr
                            key={record.id}
                            style={{
                              ...stylesObj.tableRow,
                              background: record.id === selectedRecord.id ? "#f0f7ff" : "",
                            }}
                            onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLTableRowElement).style, stylesObj.tableRowHover)}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLTableRowElement).style.background = record.id === selectedRecord.id ? "#f0f7ff" : "";
                            }}
                          >
                            <td style={{ ...stylesObj.tableCell, ...stylesObj.dateCell }}>
                              {formatDate(record.expense_date)}
                            </td>
                            <td style={stylesObj.tableCell}>
                              <span
                                style={{
                                  ...stylesObj.typeBadge,
                                  background: getTypeColor(record.type) + "20",
                                  color: getTypeColor(record.type),
                                }}
                              >
                                {record.type === "loan" ? "💰 Loan" : "💵 Expense"}
                              </span>
                            </td>
                            <td style={stylesObj.tableCell}>{record.recipient_name}</td>
                            <td style={{ ...stylesObj.tableCell, ...stylesObj.amountCell }}>
                              {formatCurrency(record.total_amount)}
                            </td>
                            <td style={stylesObj.tableCell}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "4px",
                                  background: "#e9ecef",
                                  color: "#495057",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {record.category}
                              </span>
                            </td>
                            <td style={stylesObj.tableCell}>{record.purpose}</td>
                            <td style={stylesObj.tableCell}>
                              {record.type === "loan" ? (
                                <div>
                                  <span
                                    style={{
                                      ...stylesObj.statusBadge,
                                      background: completed ? "#d4edda" : getStatusColor(status) + "20",
                                      color: completed ? "#155724" : getStatusColor(status),
                                      marginBottom: "0.25rem",
                                      display: "inline-block",
                                    }}
                                  >
                                    {completed ? "✅ COMPLETED" : status}
                                  </span>
                                  {/* <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" }}>
                                    Loan: {formatCurrency(record.total_amount)}<br />
                                    Returned: {formatCurrency(totalReturned)}<br />
                                    Remaining: {formatCurrency(actualRemaining)}
                                  </div> */}
                                </div>
                              ) : (
                                <span style={{ color: "#95a5a6", fontStyle: "italic" }}>
                                  Completed
                                </span>
                              )}
                            </td>
                            <td style={stylesObj.tableCell}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "4px",
                                  background: "#e3f2fd",
                                  color: "#1976d2",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {record.payment_method}
                              </span>
                            </td>
                            <td style={stylesObj.tableCell}>
                              <div style={stylesObj.actionButtons}>
                                {record.type === "loan" && canReturn && (
                                  <button
                                    style={stylesObj.returnButton}
                                    onClick={() => handleReturnLoan(record)}
                                    onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, stylesObj.returnButtonHover)}
                                    onMouseLeave={(e) => {
                                      (e.currentTarget as HTMLButtonElement).style.background = "#27ae60";
                                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                                    }}
                                  >
                                    💰 Return Loan
                                  </button>
                                )}
                                {record.type === "loan" && completed && (
                                  <span style={stylesObj.completedBadge}>
                                    ✅ Paid in Full
                                  </span>
                                )}
                                <button
                                  style={stylesObj.downloadButton}
                                  onClick={() => downloadLoanDetails(record)}
                                  disabled={downloadingDoc}
                                  onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, stylesObj.downloadButtonHover)}
                                  onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "#3498db";
                                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                                  }}
                                >
                                  {downloadingDoc ? "⏳ Generating..." : "📄 Download Details"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Selected Loan Details */}
                {selectedRecord.type === "loan" && (
                  <>
                    <div style={{ marginTop: "2rem", background: "#f8f9fa", padding: "1.5rem", borderRadius: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 style={{ margin: 0, color: "#2c3e50" }}>
                          📋 Selected Loan Details
                        </h3>
                        <button
                          style={stylesObj.downloadButton}
                          onClick={() => downloadLoanDetails(selectedRecord)}
                          disabled={downloadingDoc}
                          onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, stylesObj.downloadButtonHover)}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "#3498db";
                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                          }}
                        >
                          {downloadingDoc ? "⏳ Generating..." : "📄 Download Full Details"}
                        </button>
                      </div>
                      
                      {selectedLoanCompleted && (
                        <div style={{
                          background: "#d4edda",
                          color: "#155724",
                          padding: "1rem",
                          borderRadius: "6px",
                          marginBottom: "1rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem"
                        }}>
                          <span style={{ fontSize: "1.2rem" }}>✅</span>
                          <div>
                            <strong>LOAN COMPLETED</strong>
                            <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                              This loan has been fully paid. No further returns needed.
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                        <div>
                          <strong>Loan Type:</strong> {selectedRecord.loan_type || "Not specified"}
                        </div>
                        <div>
                          <strong>Expected Return Date:</strong> {selectedRecord.return_date ? formatDate(selectedRecord.return_date) : "Not specified"}
                        </div>
                        <div>
                          <strong>Interest Rate:</strong> {selectedRecord.interest_rate || 0}%
                        </div>
                        <div>
                          <strong>Original Amount:</strong> {formatCurrency(selectedRecord.total_amount)}
                        </div>
                        <div>
                          <strong>Total Returned:</strong> {formatCurrency(selectedLoanTotalReturned)}
                        </div>
                        <div>
                          <strong>Remaining Amount:</strong> {formatCurrency(selectedLoanRemaining)}
                        </div>
                        {selectedRecord.installment_amount && (
                          <div>
                            <strong>Installment Amount:</strong> {formatCurrency(selectedRecord.installment_amount)}
                          </div>
                        )}
                        {selectedRecord.total_installments && (
                          <div>
                            <strong>Total Installments:</strong> {selectedRecord.total_installments}
                          </div>
                        )}
                        {selectedRecord.collateral && (
                          <div>
                            <strong>Collateral:</strong> {selectedRecord.collateral}
                          </div>
                        )}
                        <div>
                          <strong>Remarks:</strong> {selectedRecord.remarks || "None"}
                        </div>
                      </div>
                    </div>

                    {/* Loan Returns History */}
                    <div style={stylesObj.returnsTable}>
                      <h3 style={stylesObj.returnsHeader}>
                        📊 Loan Return History ({selectedLoanReturns.length} returns)
                      </h3>
                      {selectedLoanReturns.length > 0 ? (
                        <table style={stylesObj.table}>
                          <thead style={stylesObj.tableHeader}>
                            <tr>
                              <th style={stylesObj.tableHeaderCell}>Return Date</th>
                              <th style={stylesObj.tableHeaderCell}>Return Amount</th>
                              <th style={stylesObj.tableHeaderCell}>Remaining After Return</th>
                              <th style={stylesObj.tableHeaderCell}>Payment Method</th>
                              <th style={stylesObj.tableHeaderCell}>Remarks</th>
                              <th style={stylesObj.tableHeaderCell}>Recorded On</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedLoanReturns.map((returnRecord) => (
                              <tr key={returnRecord.id} style={stylesObj.tableRow}>
                                <td style={{ ...stylesObj.tableCell, ...stylesObj.dateCell }}>
                                  {formatDate(returnRecord.return_date)}
                                </td>
                                <td style={{ ...stylesObj.tableCell, ...stylesObj.amountCell, color: "#27ae60" }}>
                                  {formatCurrency(returnRecord.return_amount)}
                                </td>
                                <td style={{ ...stylesObj.tableCell, ...stylesObj.amountCell }}>
                                  {formatCurrency(returnRecord.remaining_after_return)}
                                </td>
                                <td style={stylesObj.tableCell}>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "0.25rem 0.5rem",
                                      borderRadius: "4px",
                                      background: "#e3f2fd",
                                      color: "#1976d2",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    {returnRecord.payment_method || "Not specified"}
                                  </span>
                                </td>
                                <td style={stylesObj.tableCell}>{returnRecord.remarks || "-"}</td>
                                <td style={{ ...stylesObj.tableCell, ...stylesObj.dateCell }}>
                                  {formatDate(returnRecord.created_at)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ ...stylesObj.noData, padding: "1.5rem" }}>
                          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
                          <p>No returns recorded yet</p>
                          <p style={{ fontSize: "0.9rem", color: "#95a5a6" }}>
                            Use the "Return Loan" button above to record returns
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Return Loan Modal */}
      {showReturnModal && selectedLoanForReturn && (
        <div style={stylesObj.modalOverlay}>
          <div style={stylesObj.modal}>
            <h3 style={stylesObj.modalTitle}>Record Loan Return</h3>
            <p style={{ marginBottom: "1rem" }}>
              Borrower: <strong>{selectedLoanForReturn.recipient_name}</strong><br />
              Loan Amount: <strong>{formatCurrency(selectedLoanForReturn.total_amount)}</strong><br />
              Current Remaining: <strong>{formatCurrency(selectedLoanForReturn.remaining_amount || selectedLoanForReturn.total_amount)}</strong>
            </p>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#495057" }}>
                Return Date *
              </label>
              <input
                type="date"
                value={returnData.date}
                onChange={(e) => setReturnData({...returnData, date: e.target.value})}
                style={stylesObj.modalInput}
                required
              />
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#495057" }}>
                Return Amount (PKR) *
              </label>
              <input
                type="number"
                placeholder="Enter return amount"
                value={returnData.amount}
                onChange={(e) => setReturnData({...returnData, amount: e.target.value})}
                style={stylesObj.modalInput}
                min="0"
                max={selectedLoanForReturn.remaining_amount || selectedLoanForReturn.total_amount}
                step="0.01"
                required
              />
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#495057" }}>
                Payment Method
              </label>
              <select
                value={returnData.payment_method}
                onChange={(e) => setReturnData({...returnData, payment_method: e.target.value})}
                style={stylesObj.modalSelect}
              >
                <option value="">Select method</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#495057" }}>
                Remarks (Optional)
              </label>
              <textarea
                placeholder="Add any notes about this return..."
                value={returnData.remarks}
                onChange={(e) => setReturnData({...returnData, remarks: e.target.value})}
                style={stylesObj.modalTextarea}
              />
            </div>
            
            <div style={stylesObj.modalButtons}>
              <button
                style={{ ...stylesObj.modalButton, ...stylesObj.modalCancelButton }}
                onClick={() => {
                  setShowReturnModal(false);
                  setSelectedLoanForReturn(null);
                  setReturnData({
                    amount: "",
                    date: new Date().toISOString().split("T")[0],
                    payment_method: "",
                    remarks: ""
                  });
                }}
                disabled={processingReturn}
                onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, stylesObj.modalCancelButtonHover)}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#95a5a6";
                }}
              >
                Cancel
              </button>
              <button
                style={{ ...stylesObj.modalButton, ...stylesObj.modalConfirmButton }}
                onClick={processLoanReturn}
                disabled={processingReturn || !returnData.amount || !returnData.date}
                onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, stylesObj.modalConfirmButtonHover)}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#27ae60";
                }}
              >
                {processingReturn ? "Processing..." : "Record Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}