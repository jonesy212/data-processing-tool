import React from "react";
import { useEffect, useState } from "react";
import { useSecureUserId } from "../utils/useSecureUserId";
import { CryptoHolding } from "./CryptoHolding";
import { useCryptoManager } from "./CryptoManager";
import { SearchLogger } from "../logging/Logger";

const CryptoManagerComponent: React.FC = () => {
  const {
    holdings,
    addHolding,
    updateHolding,
    removeHolding,
    executeTransaction,
    getHoldings,
  } = useCryptoManager();

  const userId = useSecureUserId(); // Get secure user ID

  const [newHolding, setNewHolding] = useState<CryptoHolding>({
    id: "",
    currency: "",
    amount: 0,
    value: 0,
    name: "",
    ticker: "",
    valuePerUnit: 0,
    category: ""
  });
  const [updateDetails, setUpdateDetails] = useState({ id: "", amount: 0 });
  const [transactionDetails, setTransactionDetails] = useState({
    id: "",
    amount: 0,
  });

  useEffect(() => {
    getHoldings(); // Fetch holdings on component mount
  }, [getHoldings]);

  const handleAddHolding = () => {
    addHolding(newHolding);
    setNewHolding({
      id: "",
      currency: "",
      amount: 0,
      value: 0,
      name: "",
      ticker: "",
      category: "",
      valuePerUnit: 0,
    });
    SearchLogger.logSearch(`Added holding: ${newHolding.name}`, String(userId));
  };


  const handleUpdateHolding = () => {
    if (updateDetails.id && updateDetails.amount) {
      updateHolding(updateDetails.id, { amount: updateDetails.amount });
      setUpdateDetails({ id: "", amount: 0 });
    } else {
      // Handle error or show a message indicating that both id and amount are required
    }
  };

  const handleRemoveHolding = (id: string) => {
    removeHolding(id);
    SearchLogger.logSearch(`Removed holding with ID: ${id}`, String(userId));
  };

  const handleExecuteTransaction = () => {
    if (transactionDetails.id && transactionDetails.amount) {
      executeTransaction({
        id: transactionDetails.id,
        amount: transactionDetails.amount,
        timestamp: undefined,
        fromAddress: "",
        toAddress: "",
        currency: "",
        type: "SEND",
        valuePerUnit: 0,
        status: "PENDING",
      });
      setTransactionDetails({ id: "", amount: 0 });
    } else {
      // Handle error or show a message indicating that both id and amount are required
    }
  };
  return (
    <div>
      <h2>Crypto Manager</h2>

      <div>
        <h3>Add Holding</h3>
        <input
          type="text"
          value={newHolding.name}
          onChange={(e) =>
            setNewHolding({ ...newHolding, name: e.target.value })
          }
          placeholder="Enter holding name"
        />
        <input
          type="text"
          value={newHolding.currency}
          onChange={(e) =>
            setNewHolding({ ...newHolding, currency: e.target.value })
          }
          placeholder="Enter currency"
        />
        <input
          type="text"
          value={newHolding.ticker}
          onChange={(e) =>
            setNewHolding({ ...newHolding, ticker: e.target.value })
          }
          placeholder="Enter ticker"
        />
        <input
          type="number"
          value={newHolding.amount}
          onChange={(e) =>
            setNewHolding({ ...newHolding, amount: Number(e.target.value) })
          }
          placeholder="Enter amount"
        />
        <input
          type="number"
          value={newHolding.value}
          onChange={(e) =>
            setNewHolding({ ...newHolding, value: Number(e.target.value) })
          }
          placeholder="Enter value"
        />
        <input
          type="number"
          value={newHolding.valuePerUnit}
          onChange={(e) =>
            setNewHolding({
              ...newHolding,
              valuePerUnit: Number(e.target.value),
            })
          }
          placeholder="Enter value per unit"
        />
        <button onClick={handleAddHolding}>Add</button>
      </div>

      <div>
        <h3>Update Holding</h3>
        <input
          type="text"
          value={updateDetails.id}
          onChange={(e) =>
            setUpdateDetails({ ...updateDetails, id: e.target.value })
          }
          placeholder="Enter holding ID"
        />
        <input
          type="number"
          value={updateDetails.amount}
          onChange={(e) =>
            setUpdateDetails({
              ...updateDetails,
              amount: Number(e.target.value),
            })
          }
          placeholder="Enter new amount"
        />
        <button onClick={handleUpdateHolding}>Update</button>
      </div>

      <div>
        <h3>Remove Holding</h3>
        <ul>
          {holdings.map((holding) => (
            <li key={holding.id}>
              {holding.name}
              <button onClick={() => handleRemoveHolding(holding.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Execute Transaction</h3>
        <input
          type="text"
          value={transactionDetails.id}
          onChange={(e) =>
            setTransactionDetails({ ...transactionDetails, id: e.target.value })
          }
          placeholder="Enter holding ID"
        />
        <input
          type="number"
          value={transactionDetails.amount}
          onChange={(e) =>
            setTransactionDetails({
              ...transactionDetails,
              amount: Number(e.target.value),
            })
          }
          placeholder="Enter transaction amount"
        />
        <button onClick={handleExecuteTransaction}>Execute</button>
      </div>

      <div>
        <h3>Current Holdings</h3>
        <ul>
          {holdings.map((holding) => (
            <li key={holding.id}>
              {holding.name}: {holding.amount}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CryptoManagerComponent;
