import styles from "./Navbar.module.scss";
import {
  getWalletAddress,
  addUser,
  getParentClient,
} from "../../utils/constants";
import { CurrentContext } from "../../utils";
import { useEffect, useContext, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Button } from "../";
import { api } from "../../utils/contexts/CurrentContext";
import { isExpired, decodeToken } from "react-jwt";

const Navbar = () => {
  const { setWalletAddress, walletAddress, windowDetails, setUserDetails } =
    useContext(CurrentContext);
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  // Run on startup everytime to check for authToken
  // in localstorage
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      if (isExpired(token)) {
        localStorage.removeItem("authToken");
        setWalletAddress(null);
        return;
      }
      const decodedToken = decodeToken(token);
      setWalletAddress(decodedToken.walletAddress);
      connectToMetamask(decodedToken.walletAddress);
    }
  }, []);

  // useEffect(() => {
  //   connectToMetamask();
  // }, []);

  useEffect(() => {
    windowDetails?.provider?.on("accountsChanged", connectToMetamask); // Whenever wallet changes this gets called, but not on mount
    return () => {
      windowDetails?.provider?.removeListener(
        "accountsChanged",
        connectToMetamask
      );
    };
  });

  async function connectToMetamask() {
    const newWalletAddress = await getWalletAddress(
      windowDetails.provider,
      setIsErrorModalOpen
    );
    setWalletAddress(newWalletAddress);
    await addUser(newWalletAddress);
    setIsConnected(true);
    // const balanace = await getWalletBalance(walletAddress);
    if (newWalletAddress !== undefined) {
      localStorage.removeItem("authToken");
      const res = await api.post("/login", {
        walletAddress: newWalletAddress,
      });
      const token = res.data.resData.authToken;
      const user = res.data.resData.user;
      setUserDetails(user);
      localStorage.setItem("authToken", token);

      // navigate("/dashboard");
    } else if (newWalletAddress === "") {
      setIsConnected(false);
      onLogout();
    }
  }

  function onLogout() {
    setWalletAddress("");
    setIsConnected(false);
  }

  useEffect(() => {
    console.log(walletAddress, isConnected);
  });

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <NavLink to="/" className={styles.logo}>
          Logo
        </NavLink>
      </div>
      {walletAddress && (
        <div className={styles.middle}>
          <NavLink
            to="/"
            className={(item) =>
              item.isActive && styles.active ? styles.active : {}
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/dashboard"
            className={(item) =>
              item.isActive && styles.active ? styles.active : {}
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/collections"
            className={(item) =>
              item.isActive && styles.active ? styles.active : {}
            }
          >
            Collections
          </NavLink>
          <NavLink
            to="/services"
            className={(item) =>
              item.isActive && styles.active ? styles.active : {}
            }
          >
            Services
          </NavLink>
        </div>
      )}
      <div className={styles.right}>
        {windowDetails?.isMetamaskInstalled ? (
          walletAddress ? (
            <p>Wallet Address: {walletAddress}</p>
          ) : (
            <Button onClick={connectToMetamask}>Connect Wallet</Button>
          )
        ) : (
          <Button>
            <a href="https://metamask.io">Download Metamask</a>{" "}
          </Button>
        )}
      </div>
      {isErrorModalOpen && (
        <ErrorModal setIsErrorModalOpen={setIsErrorModalOpen} />
      )}
    </div>
  );
};

const ErrorModal = ({ setIsErrorModalOpen }) => {
  return (
    <div className={styles.errorModalContainer}>
      <div className={styles.modal}>
        <h3>Ahh Snap!!</h3>
        <p>Some Error Occured</p>
        <p>This Likely Happens due to one of the following reasons</p>
        <ul>
          <li>Your Metamask account is locked</li>
          <li>
            Our website is not connected with your metamask wallet, to do that
            checkout out this article on how to
            <a
              target="blank"
              href="https://metamask.zendesk.com/hc/en-us/articles/360045901112-Manually-connecting-to-a-dapp"
            >
              Manually Connect your wallet to dapp
            </a>
          </li>
        </ul>
        <Button onClick={() => setIsErrorModalOpen(false)}>I Understand</Button>
      </div>
    </div>
  );
};

export default Navbar;
