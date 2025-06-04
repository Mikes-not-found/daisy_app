import { API_PROD } from "./plaidService";
import { MoneyTrackerItem } from "../interfaces/moneyTrackerInterfaces";

export async function getMoneyTrackerService(userToken: JWT) {
  const response = await fetch(`${API_PROD}/moneyTracker`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken.jwt}`
    },
  });
  return response.json();
}

export async function insertOrUpdateMoneyTrackerItem(userToken: JWT, data: MoneyTrackerItem) {
    const response = await fetch(`${API_PROD}/insertOrUpdateMoneyTrackerItem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken.jwt}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
}


export async function deleteMoneyTrackerItemService(userToken: JWT, idItemToDelete: number) {
  console.log("Deleting item with ID:", idItemToDelete);

  try {
    const response = await fetch(`${API_PROD}/deleteMoneyTrackerItem`, {
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
    console.error("Error in deleteMoneyTrackerItemService:", error);
    throw error;
  }
}


