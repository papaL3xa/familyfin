// Service to communicate with Google Apps Script Backend

function getApiUrl() {
  return localStorage.getItem('gas_api_url');
}

function getSpreadsheetId() {
  return localStorage.getItem('gas_spreadsheet_id');
}

// --- Auth & Admin API ---

export async function registerUser(email) {
  const url = getApiUrl();
  if (!url) throw new Error("API URL not set");
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'registerUser', payload: { email } })
  });
  return await response.json();
}

export async function loginUser(email) {
  const url = getApiUrl();
  if (!url) throw new Error("API URL not set");
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'loginUser', payload: { email } })
  });
  return await response.json();
}

export async function getPendingUsers() {
  const url = getApiUrl();
  if (!url) return [];
  const response = await fetch(`${url}?action=getPendingUsers`);
  if (!response.ok) throw new Error('Network error');
  return await response.json();
}

export async function getConfig() {
  const url = getApiUrl();
  if (!url) return { adminWa: "" };
  try {
    const response = await fetch(`${url}?action=getConfig`);
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (err) {
    return { adminWa: "" };
  }
}

export async function updateConfig(configMap) {
  const url = getApiUrl();
  if (!url) return { error: "API URL belum diatur" };
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'updateConfig', payload: configMap })
  });
  return res.json();
}

export async function approveUser(email, folderId, years) {
  const url = getApiUrl();
  if (!url) return { error: "API URL belum diatur" };
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'approveUser', payload: { email, folderId, years } })
  });
  return res.json();
}

export async function rejectUser(email) {
  const url = getApiUrl();
  if (!url) return { error: "API URL belum diatur" };
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'rejectUser', payload: { email } })
  });
  return res.json();
}

export async function fetchActiveUsers() {
  const url = getApiUrl();
  if (!url) throw new Error("API URL not set");
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'getActiveUsers', payload: {} })
  });
  return await response.json();
}

export async function extendSubscription(email, years) {
  const url = getApiUrl();
  if (!url) throw new Error("API URL not set");
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'extendSubscription', payload: { email, years } })
  });
  return await response.json();
}

export async function toggleBlockUser(email) {
  const url = getApiUrl();
  if (!url) throw new Error("API URL not set");
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'toggleBlockUser', payload: { email } })
  });
  return await response.json();
}


// --- Data API ---

export async function fetchTransactions() {
  const url = getApiUrl();
  const sid = getSpreadsheetId();
  if (!url || !sid) return [];
  
  try {
    const response = await fetch(`${url}?action=getTransactions&spreadsheetId=${sid}`);
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
}

export async function addTransaction(tx) {
  const url = getApiUrl();
  const sid = getSpreadsheetId();
  if (!url) throw new Error("API URL not set");
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action: 'addTransaction', payload: tx, spreadsheetId: sid })
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
}

export async function deleteTransaction(id) {
  const url = getApiUrl();
  const sid = getSpreadsheetId();
  if (!url) throw new Error("API URL not set");
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action: 'deleteTransaction', payload: { id }, spreadsheetId: sid })
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
}

export async function fetchCategories() {
  const url = getApiUrl();
  const sid = getSpreadsheetId();
  if (!url || !sid) return [];
  
  try {
    const response = await fetch(`${url}?action=getCategories&spreadsheetId=${sid}`);
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

export async function addCategory(category) {
  const url = getApiUrl();
  const sid = getSpreadsheetId();
  if (!url) throw new Error("API URL not set");
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action: 'addCategory', payload: category, spreadsheetId: sid })
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
}

export async function deleteCategory(id) {
  const url = getApiUrl();
  const sid = getSpreadsheetId();
  if (!url) throw new Error("API URL not set");
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action: 'deleteCategory', payload: { id }, spreadsheetId: sid })
    });
    return await response.json();
    } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}

export async function fetchWallets() {
  const url = getApiUrl();
  const sid = getSpreadsheetId();
  if (!url || !sid) return [];
  
  try {
    const response = await fetch(`${url}?action=getWallets&spreadsheetId=${sid}`);
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (error) {
    console.error("Error fetching wallets:", error);
    throw error;
  }
}

export async function addWallet(wallet) {
  const url = getApiUrl();
  const sid = getSpreadsheetId();
  if (!url) throw new Error("API URL not set");
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action: 'addWallet', payload: wallet, spreadsheetId: sid })
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding wallet:", error);
    throw error;
  }
}

export async function deleteWallet(id) {
  const url = getApiUrl();
  const sid = getSpreadsheetId();
  if (!url) throw new Error("API URL not set");
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action: 'deleteWallet', payload: { id }, spreadsheetId: sid })
    });
    return await response.json();
    } catch (error) {
    console.error("Error deleting wallet:", error);
    throw error;
  }
}

export async function fetchDebts() {
  const url = getApiUrl();
  const sid = getSpreadsheetId();
  if (!url || !sid) return [];
  
  try {
    const response = await fetch(`${url}?action=getDebts&spreadsheetId=${sid}`);
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (error) {
    console.error("Error fetching debts:", error);
    throw error;
  }
}

export async function addDebt(debt) {
  const url = getApiUrl();
  const sid = getSpreadsheetId();
  if (!url) throw new Error("API URL not set");
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action: 'addDebt', payload: debt, spreadsheetId: sid })
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding debt:", error);
    throw error;
  }
}

export async function deleteDebt(id) {
  const url = getApiUrl();
  const sid = getSpreadsheetId();
  if (!url) throw new Error("API URL not set");
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action: 'deleteDebt', payload: { id }, spreadsheetId: sid })
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting debt:", error);
    throw error;
  }
}
