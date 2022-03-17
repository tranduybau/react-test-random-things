import { useEffect, useState } from "react";
import "./App.css";
import usdcJson from "./contracts/Token.json";
import ctrlJson from "./contracts/Controller.json";
import { ethers } from "ethers";

import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { InputLabel } from "@mui/material";

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary
}));

const usdcAbi = usdcJson.abi;
const ctrlAbi = ctrlJson.abi;

let chainId;

const getUsdcAddress = () => {
  if (chainId == 43113) {
    return "0x2c04557Fd66ec8B5f2d2820Fe8DB1CC4b4Fcc8b8";
  }
  if (chainId == 97) {
    return "0x012529e5f83BA6E3ddB10dA65CEFE6677Cf3816F";
  }
  return "";
};

const getCtrlAddress = () => {
  if (chainId == 43113) {
    return "0x23e25B10DdC8dF65BA49F183B2002652aACa972c";
  }
  if (chainId == 97) {
    return "0xE0032c98788C6958A170663C2395fff2f9952331";
  }
  return "";
};

const getPoolPrice = () => {
  if (chainId == 43113) {
    return "50000000";
  }
  if (chainId == 97) {
    return "50000000000000000000";
  }
  return "";
};

const getFaucetAmount = () => {
  if (chainId == 43113) {
    return "10000000000";
  }
  if (chainId == 97) {
    return "10000000000000000000000";
  }
  return "";
};

const getApprovalAmount = () => {
  if (chainId == 43113) {
    return "1000000000000";
  }
  if (chainId == 97) {
    return "1000000000000000000000000";
  }
  return "";
};

const poolMax = "3";

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(null);
  const [users, setUsers] = useState(null);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!");
    }
    ethereum.on("accountsChanged", (accounts) => {
      window.location.reload();
    });
    ethereum.on("chainChanged", (chainId) => {
      window.location.reload();
    });
    const provider = new ethers.providers.Web3Provider(ethereum);
    chainId = (await provider.getNetwork()).chainId;
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0];
      setCurrentAccount(account);
      loadCurrentRound();
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  };

  const callFaucet = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const usdcContract = new ethers.Contract(
          getUsdcAddress(),
          usdcAbi,
          signer
        );
        let nftTxn = await usdcContract.faucet(
          currentAccount,
          getFaucetAmount()
        );
        await nftTxn.wait();
      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const loadCurrentRound = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const ctrlContract = new ethers.Contract(
          getCtrlAddress(),
          ctrlAbi,
          provider
        );
        let roundIndex = await ctrlContract.getCurrentPoolRoundIndex(
          getPoolPrice(),
          poolMax
        );
        setCurrentRoundIndex(roundIndex.toString());
        loadRoundInfo(roundIndex.toString());
      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const loadRoundInfo = async (roundIndex) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const ctrlContract = new ethers.Contract(
          getCtrlAddress(),
          ctrlAbi,
          provider
        );
        let roundInfo = await ctrlContract.getPoolRound(
          getPoolPrice(),
          poolMax,
          roundIndex
        );
        setUsers(roundInfo[2]);
      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const approval = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const usdcContract = new ethers.Contract(
          getUsdcAddress(),
          usdcAbi,
          signer
        );
        let nftTxn = await usdcContract.approve(
          getCtrlAddress(),
          getApprovalAmount()
        );
        await nftTxn.wait();
      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const enterRound = async (selectIndex) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const ctrlContract = new ethers.Contract(
          getCtrlAddress(),
          ctrlAbi,
          signer
        );
        let nftTxn = await ctrlContract.enterRound(
          getPoolPrice(),
          poolMax,
          currentRoundIndex,
          selectIndex,
          "0x088D8A4a03266870EDcbbbADdA3F475f404dB9B2"
        );
        await nftTxn.wait();
        loadRoundInfo(currentRoundIndex);
      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const connectWalletButton = () => {
    return <Button onClick={connectWalletHandler}>Connect Wallet</Button>;
  };

  const showAccountAddress = () => {
    return <InputLabel>{currentAccount}</InputLabel>;
  };

  useEffect(() => {
    checkWalletIsConnected();
  }, []);

  const prizeRound = async (selectIndex) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const ctrlContract = new ethers.Contract(
          getCtrlAddress(),
          ctrlAbi,
          signer
        );
        let nftTxn = await ctrlContract.prizeRound(
          getPoolPrice(),
          poolMax,
          currentRoundIndex - 1
        );
        await nftTxn.wait();
      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const prevRound = () => {
    return (
      <Grid item xs={12}>
        <Item>
          <Button
            onClick={() => {
              prizeRound();
            }}
            variant="contained"
          >
            Your Win Round {currentRoundIndex - 1} -> Prize
          </Button>
        </Item>
      </Grid>
    );
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={2}></Grid>
          <Grid item xs={8}>
            <Item>
              {currentAccount ? showAccountAddress() : connectWalletButton()}
            </Item>
          </Grid>
          <Grid item xs={2}></Grid>
          <Grid item xs={12}>
            <Item>Round {currentRoundIndex}</Item>
          </Grid>
          <Grid item xs={12}>
            <Item>
              <Button
                onClick={() => {
                  enterRound("0");
                }}
                variant="contained"
              >
                1 ->{" "}
                {users &&
                users.length > 0 &&
                users[0].toString() !=
                  "0x0000000000000000000000000000000000000000"
                  ? users[0]
                  : "Not yet selected"}
              </Button>
            </Item>
          </Grid>
          <Grid item xs={12}>
            <Item>
              <Button
                onClick={() => {
                  enterRound("1");
                }}
                variant="contained"
              >
                2 ->{" "}
                {users &&
                users.length > 1 &&
                users[1].toString() !=
                  "0x0000000000000000000000000000000000000000"
                  ? users[1]
                  : "Not yet selected"}
              </Button>
            </Item>
          </Grid>
          <Grid item xs={12}>
            <Item>
              <Button
                onClick={() => {
                  enterRound("2");
                }}
                variant="contained"
              >
                3 ->{" "}
                {users &&
                users.length > 2 &&
                users[2].toString() !=
                  "0x0000000000000000000000000000000000000000"
                  ? users[2]
                  : "Not yet selected"}
              </Button>
            </Item>
          </Grid>
          <Grid item xs={6}>
            <Item>
              <Button
                onClick={() => {
                  approval();
                }}
                variant="contained"
              >
                Approval
              </Button>
            </Item>
          </Grid>
          <Grid item xs={6}>
            <Item>
              <Button
                onClick={() => {
                  callFaucet();
                }}
                variant="contained"
              >
                Faucet
              </Button>
            </Item>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default App;
