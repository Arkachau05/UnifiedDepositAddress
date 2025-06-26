const { ethers } = require("ethers");
require("dotenv").config();

// Contract ABI (Only functions we need)
const FORWARDER_ABI = [
  "function forwardFunds() external",
  "function relayer() view returns (address)",
  "function recipient() view returns (address)"
];

async function main() {
  console.log("🚀 Starting fund forwarder...");

  // 1. Setup provider and signer (relayer wallet)
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
  const relayer = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);

  // 2. Connect to deployed DepositForwarder contract
  const forwarder = new ethers.Contract(
    process.env.SEPOLIA_FORWARDER_ADDRESS,
    FORWARDER_ABI,
    relayer
  );

  const expectedRelayer = await forwarder.relayer();
  const expectedRecipient = await forwarder.recipient();

  console.log("🔑 Relayer Address:", relayer.address);
  console.log("🎯 Contract Address:", forwarder.target);
  console.log("📦 Recipient Address:", expectedRecipient);

  if (relayer.address.toLowerCase() !== expectedRelayer.toLowerCase()) {
    throw new Error("❌ Relayer is not authorized to call forwardFunds()");
  }

  // 3. Check balance before forwarding
  const contractBalance = await provider.getBalance(forwarder.target);
  console.log("💰 Contract ETH Balance:", ethers.formatEther(contractBalance), "ETH");

  if (contractBalance === 0n) {
    console.warn("⚠️ No ETH in contract to forward.");
  }

  // 4. Call forwardFunds()
  console.log("⏩ Calling forwardFunds()...");
  const tx = await forwarder.forwardFunds({ gasLimit: 150000 });
  console.log("📝 TX Hash:", tx.hash);

  const receipt = await tx.wait();
  console.log(`✅ Forwarded successfully in block ${receipt.blockNumber}`);
  console.log("⛽ Gas Used:", receipt.gasUsed.toString());
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
