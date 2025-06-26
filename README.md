
# 🔁 Unified Cross-Chain ETH/USDC Deposit Forwarder

This project implements a **unified deposit address system** using smart contracts, Hardhat, and Node.js to **auto-forward ETH and USDC** from a contract to a fixed recipient on **multiple testnets (Sepolia and Zetachain)**.

---

## ⚙️ Project Structure

```
project-root/
├── contracts/
│   ├── DepositForwarder.sol       # Smart contract
│   └── scripts/deploy.js          # Deployment script
├── backend/
│   ├── index.js                   # ETH/USDC forwarding monitor
│   ├── send-eth.js                # ETH sender to contract
├── .env                           # Secrets and config
├── hardhat.config.js              # Hardhat setup
```

---

## 1️⃣ Prerequisites

- Node.js 18+
- `npm install -g hardhat`
- Alchemy RPC for Sepolia & Zetachain testnet
- Some Sepolia ETH and Zetachain ETH for gas
- USDC tokens (faucet or mint on testnet)

---

## 2️⃣ Setup

1. **Clone the repo**
```bash
git clone <your-repo-url>
cd project-root
```

2. **Install dependencies**
```bash
npm install
cd backend && npm install
```

3. **Setup your `.env`**

`.env` (root + backend/):
```
# RPCs
SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/...
ZETACHAIN_RPC=https://zetachain-testnet.g.alchemy.com/v2/...

# Wallets
DEPLOYER_PRIVATE_KEY=...
RELAYER_PRIVATE_KEY=...

# Tokens
SEPOLIA_USDC=0xYourSepoliaUSDC
ZETACHAIN_USDC=0xYourZetaUSDC

# Recipient
RECIPIENT_ADDRESS=0xYourFinalReceiver

# Filled after deploy:
SEPOLIA_FORWARDER_ADDRESS=
ZETACHAIN_FORWARDER_ADDRESS=
```

---

## 3️⃣ Contract Deployment

```bash
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat run scripts/deploy.js --network zetachain
```

Update `.env` with the deployed contract addresses shown in the logs.

---

## 4️⃣ Sending ETH

From the backend folder:
```bash
cd backend
node send-eth.js
```

This sends ETH to the Sepolia forwarder contract.

---

## 5️⃣ Monitoring & Auto Forwarding

Run your backend listener to monitor USDC or ETH balance and auto forward:
```bash
node index.js
```

It will:
- Listen for contract balance updates.
- Call `forwardFunds()` using the relayer if funds are detected.

---

## ✅ Contract Behavior

- `receive()` accepts ETH
- `forwardFunds()` callable only by relayer
- Transfers ETH and all USDC tokens (from [2] array) to recipient
- Non-reverting on failed token transfers

---

## 🧪 Testing

Use testnet faucets:
- [Sepolia Faucet](https://sepoliafaucet.com)
- [ZetaChain Faucet](https://labs.zetachain.com/faucet)

Mint testnet USDC or get it via faucet (if available).

---

## 🛠️ Notes

- Supports expansion for additional tokens
- You can enhance it with Chainlink Keepers, Gelato, etc.
- Consider adding EIP-2771 support for meta-transactions

---

## 💡 Use Cases

- Unified cross-chain donation addresses
- DeFi vaults with auto-collection
- Automated treasury management

---

Developed for use in hackathons, DeFi tools, and cross-chain automation tasks.
