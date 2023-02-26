const { ethers, upgrades } = require("hardhat");
const deployments = require("../deployments.json");
const fs = require("fs");

async function main() {
  const signer = await ethers.getSigner();
  const V1 = await ethers.getContractFactory("VendingMachineV1", signer);
  const proxy = await upgrades.deployProxy(V1, [100]);
  await proxy.deployed();

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxy.address
  );
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxy.address);
  deployments["Proxy"] = proxy.address;
  deployments["Admin"] = adminAddress;
  deployments["V1"] = implementationAddress;
  fs.writeFileSync("deployments.json", JSON.stringify(deployments));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
