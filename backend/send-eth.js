require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC;
  const privateKey = process.env.RELAYER_PRIVATE_KEY;
  const contractAddress = process.env.SEPOLIA_FORWARDER_ADDRESS;

  if (!rpcUrl || !privateKey || !contractAddress) {
    throw new Error("❌ Missing environment variables in .env file.");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const relayer = new ethers.Wallet(privateKey, provider);

  console.log("🔍 Network:", (await provider.getNetwork()).name);
  console.log("🔑 Relayer:", relayer.address);
  console.log("📬 Target Contract:", contractAddress);

  const ethToSend = "0.011";

  // Check balance
  const balance = await provider.getBalance(relayer.address);
  if (balance < ethers.parseEther(ethToSend)) {
    throw new Error(`❌ Insufficient balance. You need at least ${ethToSend} ETH.`);
  }

  try {
    console.log(`\n💸 Sending ${ethToSend} ETH to the contract...`);
    const tx = await relayer.sendTransaction({
      to: contractAddress,
      value: ethers.parseEther(ethToSend),
      gasLimit: 60000, // use higher if needed
    });

    console.log(`📝 Transaction Hash: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();

    console.log("✅ ETH sent successfully!");
    console.log(`📦 Block: ${receipt.blockNumber}`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    const contractBalance = await provider.getBalance(contractAddress);
    console.log(`💼 Contract New Balance: ${ethers.formatEther(contractBalance)} ETH`);

  } catch (err) {
    console.error("❌ Transaction failed:");
    console.error(err.reason || err.message || err);
    process.exit(1);
  }
}

main();
