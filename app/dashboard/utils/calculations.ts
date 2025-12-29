    import { supabase } from "@/lib/supabaseClient";

export async function getDashboardStats() {
  try {
    // Fetch all donors data
    const { data: donors, error: donorsError } = await supabase
      .from("doners")
      .select("total_amount");

    // Fetch all expense_records data (both loans and expenses)
    const { data: financeRecords, error: financeError } = await supabase
      .from("expense_records")
      .select("total_amount, type");

    if (donorsError || financeError) {
      console.error("Error fetching data:", donorsError || financeError);
      return null;
    }

    // Calculate totals
    const totalFunds = donors?.reduce((sum, donor) => sum + donor.total_amount, 0) || 0;
    
    // Separate loans and expenses
    const loans = financeRecords?.filter(record => record.type === "loan") || [];
    const expenses = financeRecords?.filter(record => record.type === "expense") || [];
    
    const totalLoans = loans.reduce((sum, loan) => sum + loan.total_amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.total_amount, 0);
    
    // Calculate active loans (not completed)
    const { data: activeLoansData } = await supabase
      .from("expense_records")
      .select("total_amount, remaining_amount")
      .eq("type", "loan")
      .neq("loan_status", "completed");

    const totalActiveLoans = activeLoansData?.reduce((sum, loan) => 
      sum + (loan.remaining_amount || loan.total_amount), 0) || 0;
    
    // Calculate available balance
    const availableBalance = totalFunds - totalExpenses - totalActiveLoans;

    // Count records
    const { count: totalDonors } = await supabase
      .from("doners")
      .select("*", { count: "exact", head: true });

    const { count: totalLoansCount } = await supabase
      .from("expense_records")
      .select("*", { count: "exact", head: true })
      .eq("type", "loan");

    const { count: totalExpensesCount } = await supabase
      .from("expense_records")
      .select("*", { count: "exact", head: true })
      .eq("type", "expense");

    // Get recent activity
    const { data: recentDonors } = await supabase
      .from("doners")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: recentTransactions } = await supabase
      .from("expense_records")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    return {
      totalFunds,
      totalLoans,
      totalExpenses,
      availableBalance,
      totalActiveLoans,
      totalDonors: totalDonors || 0,
      totalLoansCount: totalLoansCount || 0,
      totalExpensesCount: totalExpensesCount || 0,
      recentDonors: recentDonors || [],
      recentTransactions: recentTransactions || []
    };
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return null;
  }
}