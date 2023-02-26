const { ethers, upgrades } = require("hardhat");
const proxyAddress = "0xb18213bC2629532bb0e4026fE281eF85F735a718";

async function main() {
  const VendingMachineV2 = await ethers.getContractFactory("VendingMachineV2");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, VendingMachineV2);

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );

  const owner = await upgraded.owner();

  console.log("The current contract owner is: " + owner);
  console.log("Implementation contract address: " + implementationAddress);
}

main();
