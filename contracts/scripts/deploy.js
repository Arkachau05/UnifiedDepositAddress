// scripts/deploy.js
require('dotenv').config();
const hre = require("hardhat");
const { keccak256, toUtf8Bytes } = hre.ethers;

// Main deploy function
async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("🔧 Using deployer:", deployer.address);
  console.log("⛓️  Network:", hre.network.name);

  // Load env vars
  const recipient = process.env.RECIPIENT_ADDRESS;
  const usdcSepolia = process.env.SEPOLIA_USDC;
  const usdcZeta = process.env.ZETACHAIN_USDC;

  // Validate inputs
  if (!recipient || !usdcSepolia || !usdcZeta) {
    throw new Error("❌ Missing RECIPIENT_ADDRESS / SEPOLIA_USDC / ZETACHAIN_USDC in .env");
  }

  const relayer = deployer.address; // Or use process.env.RELAYER_ADDRESS if needed
  const tokenArray = [usdcSepolia, usdcZeta];

  console.log("📦 Constructor Arguments:");
  console.log("- Recipient:", recipient);
  console.log("- Relayer  :", relayer);
  console.log("- Tokens   :", tokenArray);

  // Get contract factory
  const Factory = await hre.ethers.getContractFactory("DepositForwarder");

  // Optional CREATE2 support
  const useCreate2 = false; // set to true if needed
  if (useCreate2) {
    const salt = keccak256(toUtf8Bytes("cross-chain-usdc-forwarder"));
    const encodedArgs = hre.ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "address", "address[2]"],
      [recipient, relayer, tokenArray]
    );
    const bytecode = Factory.bytecode + encodedArgs.slice(2);
    const bytecodeHash = keccak256(bytecode);
    const predictedAddress = hre.ethers.getCreate2Address(
      deployer.address,
      salt,
      bytecodeHash
    );

    console.log("🔮 Predicted address (CREATE2):", predictedAddress);
    console.log("🚀 Deploying with CREATE2 is not yet implemented.");
    return;
  }

  // Regular deployment
  console.log("🚀 Deploying contract...");
  const contract = await Factory.deploy(recipient, relayer, tokenArray);
  await contract.waitForDeployment();

  const deployedAddress = await contract.getAddress();
  console.log("✅ Deployed to:", deployedAddress);

  // Print explorer link
  const explorerPrefix = hre.network.name === 'sepolia'
    ? 'https://sepolia.etherscan.io/address/'
    : hre.network.name === 'zetachain'
      ? 'https://explorer.zetachain.com/address/'
      : '';
  console.log("🔗 Explorer:", `${explorerPrefix}${deployedAddress}`);

  // Suggest .env update
  console.log("\n📝 Add to your .env:");
  console.log(`${hre.network.name.toUpperCase()}_FORWARDER_ADDRESS=${deployedAddress}`);
}

// Run script
main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
