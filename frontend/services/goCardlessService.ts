import { TransactionDatesInterval } from "../interfaces/transactionsInterfaces";
import { API_GOCARDLESS, API_PROD } from "./plaidService";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GoCardlessToken {
  access_token: string;
  access_token_expires: number;
  refresh_access_token: string;
  refresh_access_token_expires: number;
}

export interface DateRange {
  start_date?: string;
  end_date?: string;
}

export interface Institution {
  id: string;
  name: string;
  bic: string;
  logo: string;
  countries: string[];
}

class GoCardlessService {
  [x: string]: any;
  private static readonly ACCESS_TOKEN_KEY = '@gocardless_access_token';
  private static readonly REFRESH_TOKEN_KEY = '@gocardless_refresh_token';
  private static readonly EXPIRES_KEY = '@gocardless_expires';
  private static readonly REFRESH_EXPIRES_KEY = '@gocardless_refresh_expires';
  async setTokens(tokenResponse: GoCardlessToken) {
    try {
      console.log(tokenResponse);
      if (!tokenResponse.access_token || !tokenResponse.refresh_access_token) {
        throw new Error('Token invalidi');
      }
      
      await AsyncStorage.multiSet([
        [GoCardlessService.ACCESS_TOKEN_KEY, tokenResponse.access_token],
        [GoCardlessService.REFRESH_TOKEN_KEY, tokenResponse.refresh_access_token],
        [GoCardlessService.EXPIRES_KEY, tokenResponse.access_token_expires.toString()],
        [GoCardlessService.REFRESH_EXPIRES_KEY, tokenResponse.refresh_access_token_expires.toString()]
      ]);
    } catch (error) {
      console.error('Errore nel salvataggio dei token:', error);
      throw error;
    }
  }

  async refreshAccessToken(userToken: JWT, refreshToken: string): Promise<GoCardlessToken | null> {
    try {
      const response = await fetch(`${API_GOCARDLESS}/token/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken.jwt}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) throw new Error('Refresh token failed');

      const newTokens: GoCardlessToken = await response.json();
      await this.setTokens(newTokens);
      return newTokens;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  async getToken(userToken: JWT) {
    try {
      const response = await fetch(`${API_GOCARDLESS}/token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken.jwt}`,
          'Content-Type': 'application/json',
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting token:', error);
      throw error;
    }
  }

  async getBankList(userToken: JWT, accessToken: string) {
    try {
      const response = await fetch(`${API_GOCARDLESS}/bankList`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken.jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken: accessToken })
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting token:', error);
      throw error;
    }
  }

  async createEndUserAgreement(userToken: string, institutionId: string, accessToken: string) {
    try {
      const response = await fetch(`${API_GOCARDLESS}/agreement`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ institutionId, accessToken })
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating agreement:', error);
      throw error;
    }
  }

  async buildLink(userToken: JWT, institutionId: string, accessToken: string) {
    try {
      const response = await fetch(`${API_GOCARDLESS}/buildLink`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken.jwt}`
        },
        body: JSON.stringify({ institutionId, accessToken })
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating requisition:', error);
      throw error;
    }
  }

  async getAccounts(userToken: JWT) {
    try {
      const response = await fetch(`${API_GOCARDLESS}/accounts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken.jwt}`,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  }

  async getDetailAccounts(userToken: JWT) {
    try {
      const response = await fetch(`${API_GOCARDLESS}/detailAccounts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken.jwt}`,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  }

  async  getTransactionsService(userToken: JWT, dateRange?: TransactionDatesInterval) {      
    let url = `${API_GOCARDLESS}/transactions`;
    
    // Aggiungiamo i query parameters se sono presenti le date
    if (dateRange) {
      const params = new URLSearchParams();
      if (dateRange.start_date) params.append('start_date', dateRange.start_date);
      if (dateRange.end_date) params.append('end_date', dateRange.end_date);
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken.jwt}`
      },
    });
    return response.json();
  }

  async getStoredToken(): Promise<GoCardlessToken | null> {
    try {
      const values = await AsyncStorage.multiGet([
        GoCardlessService.ACCESS_TOKEN_KEY,
        GoCardlessService.REFRESH_TOKEN_KEY,
        GoCardlessService.EXPIRES_KEY,
        GoCardlessService.REFRESH_EXPIRES_KEY,
      ]);
      
      if (values.some(([_, value]) => !value)) {
        return null;
      }

      const token: GoCardlessToken = {
        access_token: values[0][1]!,
        refresh_access_token: values[1][1]!,
        access_token_expires: parseInt(values[2][1]!, 10),
        refresh_access_token_expires: parseInt(values[3][1]!, 10),
      };

      if (isNaN(token.access_token_expires) || isNaN(token.refresh_access_token_expires)) {
        return null;
      }

      return token;
    } catch (error) {
      console.error('Errore nel recupero del token salvato:', error);
      return null;
    }
  }


  async saveBankDetails(userToken: JWT, access_token: string, requisitionId: string, institutionId: string) {
    const response = await fetch(`${API_GOCARDLESS}/syncAllData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken.jwt}`
      },
      body: JSON.stringify({ access_token: access_token, requisitionId: requisitionId, institutionId: institutionId })
    });
    return response.json();
  }

  async deleteCard(userToken: JWT, id_account: string) {
    const response = await fetch(`${API_GOCARDLESS}/deleteBankCard`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken.jwt}`
      },
      body: JSON.stringify({ id_account: id_account })
    });
    return response.json();
  }
}

export const goCardlessService = new GoCardlessService();

