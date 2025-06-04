import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { goCardlessService, GoCardlessToken } from '../services/goCardlessService';
import { useUser } from '../auth/UserContext';
import { BankCardDetails } from '../interfaces/profileInterfaces';
import { TransactionDatesInterval, TransactionsData } from '../interfaces/transactionsInterfaces';
import { MoneyTrackerItem } from '../interfaces/moneyTrackerInterfaces';
import { getMoneyTrackerService } from '../services/moneyTrackerService';


interface GoCardlessContextType {
  accessToken: GoCardlessToken | null;
  refreshToken: () => Promise<void>;
  syncAccounts: boolean;
  setSyncAccounts: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  error: string | null;
  profileBankData: BankCardDetails[] | null;
  listTransactionData: TransactionsData | null;
  refreshListTransactionData: (dateRange: TransactionDatesInterval) => void;
  refreshProfileBankData: () => void;
  listMoneyTracker: MoneyTrackerItem[] | null;
  refreshMoneyTracker: () => void;
  checkTokenValidity: () => Promise<void>;
}


const GoCardlessContext = createContext<GoCardlessContextType | undefined>(undefined);

export const GoCardlessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<GoCardlessToken | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userToken } = useUser();
  const [syncAccounts, setSyncAccounts] = useState<boolean>(false)
  const [profileBankData, setProfileBankData] = useState<BankCardDetails[]>([]);
  const [listTransactionData, setListTransactionData] = useState<BankCardDetails[]>([]);
  const [listMoneyTracker, setListMoneyTracker] = useState<MoneyTrackerItem[]>([]);

  const checkTokenValidity = async () => {
    console.log('🚀 [GoCardlessContext] ------------ CHECK TOKEN -----------------');
    const now = Math.floor(Date.now() / 1000);
    try {
      setLoading(true);
      let storedToken = null;
      
      try {
        storedToken = await goCardlessService.getStoredToken();
        
      } catch (parseError) {
        console.warn('⚠️ [GoCardlessContext] Errore nel recupero del token salvato:', parseError);
      }

      if(checkTokenFields(storedToken)) {
          if (storedToken?.access_token_expires! > now) {
            console.log("Token ancora valido, nessuna azione da fare", storedToken);
            setAccessToken(storedToken);
          } else if (now >= storedToken?.access_token_expires! && storedToken?.refresh_access_token_expires! > now) {
            console.log("Token non valido, usare il refresh token", storedToken?.refresh_access_token);
            refreshToken(storedToken?.refresh_access_token!);
          } else {
            console.log('🔑 [GoCardlessContext] Richiesta nuovo token...');
            const newToken = await goCardlessService.getToken(userToken);
            await goCardlessService.setTokens(newToken);
            setAccessToken(newToken);
            console.log('✨ [GoCardlessContext] Nuovo token ottenuto e salvato');
        }
      } else {
        console.log('🔑 [GoCardlessContext] Richiesta nuovo token...');
        const newToken = await goCardlessService.getToken(userToken);
        await goCardlessService.setTokens(newToken);
        setAccessToken(newToken);
        console.log('✨ [GoCardlessContext] Nuovo token ottenuto e salvato');
      }

      
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '[GoCardlessContext] Errore Generico validità token');
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Riattiva l'useEffect per l'inizializzazione
  useEffect(() => {
    if (userToken) {
      checkTokenValidity();
      refreshProfileBankData();
      refreshListTransactionData();
      refreshMoneyTracker();
    }
  }, [userToken]);

  const refreshProfileBankData = async () => {
    setLoading(true);
    await goCardlessService.getDetailAccounts(userToken)
    .then((response) => {
      console.log("CI SIAMO: ", response);
      setProfileBankData(response);
    })
    .catch(() => console.error('Failed to retrieve Detail Accounts'))
    .finally(() => setLoading(false))
  }

  const refreshMoneyTracker = async () => {
    setLoading(true);
    try {
        const result = await getMoneyTrackerService(userToken);
        setListMoneyTracker(result);   
        console.log("fatto refresh money tracker", result);
    } catch (err) {
        console.error('Error fetching money tracker:', err);
    } finally {
        setLoading(false);
    }
  };
  
  const refreshListTransactionData = async (dateRange?: TransactionDatesInterval) => {
    setLoading(true);
    try {
        const result = await goCardlessService.getTransactionsService(userToken, dateRange);
        setListTransactionData(result);   
        console.log("fatto refresh transazioni");
    } catch (err) {
        console.error('Error fetching transactions:', err);
    } finally {
        setLoading(false);
    }
  };

  const refreshToken = async (refresh_token: string) => {
      console.log('🔄 [GoCardlessContext] Avvio refresh token...');
      const newToken = await goCardlessService.refreshAccessToken(userToken, refresh_token);
      if (newToken) {
        console.log('✅ [GoCardlessContext] Refresh completato');
        setAccessToken(newToken);
      }
  };

  // Funzione per verificare se tutti i campi sono valorizzati
const checkTokenFields = (token: GoCardlessToken | null) => {
  if(token) {
    // Verifica se ogni valore dell'oggetto è falsy
    const allFieldsFilled = Object.values(token).every(value => value); 

    if (!allFieldsFilled) {
      console.log("Errore: alcuni campi sono vuoti o mancanti.");
      return false;
    }
  } else {
    return false;
  }
  console.log("Tutti i campi sono valorizzati!");
  return true;
};

  const contextValue = useMemo(() => ({
    accessToken,
    refreshToken,
    loading,
    error,
    checkTokenValidity,
    syncAccounts,
    setSyncAccounts,
    profileBankData,
    listTransactionData,
    refreshProfileBankData,
    refreshListTransactionData,
    listMoneyTracker,
    refreshMoneyTracker
  }), [accessToken, loading, error, syncAccounts, setSyncAccounts, profileBankData, listTransactionData, listMoneyTracker]);
  return (
    <GoCardlessContext.Provider value={contextValue as unknown as GoCardlessContextType}>
      {children}
    </GoCardlessContext.Provider>
  );
};

export const useGoCardless = () => {
  const context = useContext(GoCardlessContext);
  if (!context) {
    throw new Error('useGoCardless must be used within a GoCardlessProvider');
  }
  return context;
}; 
