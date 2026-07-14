import { createContext, useContext, useState } from 'react';

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([]);

  const toggleCompare = (property) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === property.id);
      if (exists) return prev.filter(p => p.id !== property.id);
      if (prev.length >= 3) return prev;
      return [...prev, property];
    });
  };

  const removeFromCompare = (id) => {
    setCompareList(prev => prev.filter(p => p.id !== id));
  };

  const clearCompare = () => setCompareList([]);

  const isInCompare = (id) => compareList.some(p => p.id === id);

  return (
    <CompareContext.Provider value={{ compareList, toggleCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
