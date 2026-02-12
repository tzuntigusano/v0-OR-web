"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Division = 'PVP' | 'INDUSTRIAL';

interface DivisionContextType {
  division: Division;
  setDivision: (div: Division) => void;
  isIndustrial: boolean;
}

const DivisionContext = createContext<DivisionContextType | undefined>(undefined);

export function DivisionProvider({ children }: { children: ReactNode }) {
  const [division, setDivision] = useState<Division>('PVP');
  const isIndustrial = division === 'INDUSTRIAL';

  // Control centralizado de los colores del body
  useEffect(() => {
    if (isIndustrial) {
      document.body.classList.add('industrial');
    } else {
      document.body.classList.remove('industrial');
    }
  }, [isIndustrial]);

  return (
    <DivisionContext.Provider value={{ 
      division, 
      setDivision, 
      isIndustrial 
    }}>
      {children}
    </DivisionContext.Provider>
  );
}

export const useDivision = () => {
  const context = useContext(DivisionContext);
  if (!context) throw new Error("useDivision debe usarse dentro de DivisionProvider");
  return context;
};