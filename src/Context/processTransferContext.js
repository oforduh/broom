import { createContext, useContext, useState } from "react";
export const TransferContext = createContext(null);

export const TransferObject = () => {
  const { processingTransfer, setProcessingTransfer } =
    useContext(TransferContext);
  return { processingTransfer, setProcessingTransfer };
};

// 2nd Step 2
export const TransferProvider = ({ children }) => {
  const [processingTransfer, setProcessingTransfer] = useState(false);

  return (
    <TransferContext.Provider
      value={{
        processingTransfer,
        setProcessingTransfer,
      }}
    >
      {children}
    </TransferContext.Provider>
  );
};
