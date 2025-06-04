import { SavingItem } from "../interfaces/savings";
import { API_PROD } from "./plaidService";



export async function getSavingsService(userToken: JWT) {  
  const response = await fetch(`${API_PROD}/savings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken.jwt}`
    },
  });
  return response.json();
}

export async function insertOrUpdateSavingService(userToken: JWT, data: SavingItem) {  
    const response = await fetch(`${API_PROD}/insertOrUpdateSaving`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken.jwt}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
}


export async function deleteSavingItemService(userToken: JWT, idItemToDelete: number) {
  console.log("Deleting saving with ID:", idItemToDelete);

  try {
    const response = await fetch(`${API_PROD}/deleteSaving`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken.jwt}`
      },
      body: JSON.stringify({ id: idItemToDelete })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Delete request failed:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Delete response:", data);
    return data;
    
  } catch (error) {
    console.error("Error in deleteSavingItemService:", error);
    throw error;
  }
}