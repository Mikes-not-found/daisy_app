import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  
  const value = useMemo(
    () => {
      console.log('🔑 Token attuale:', userToken);
      return { userToken, setUserToken };
    }, 
    [userToken]
  );

  useEffect(() => {
    console.log('🔄 Token aggiornato:', userToken);
  }, [userToken]);

  console.log('🔄 Render del Provider con token:', userToken);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useUser = () => {
  const context = useContext(UserContext);
  return context;
};
