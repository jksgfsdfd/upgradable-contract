const { ethers } = require("hardhat");
async function initialFixture() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const admin = signers[1];

  const V1 = await ethers.getContractFactory("VendingMachineV1", deployer);
  const v1 = await V1.deploy();
  await v1.deployed();

  const Proxy = await ethers.getContractFactory(
    "TransparentUpgradeableProxy",
    deployer
  );

  const ABI = ["function initialize(uint)"];
  const interface = new ethers.utils.Interface(ABI);
  const calldata = interface.encodeFunctionData("initialize", [74]);
  const proxy = await Proxy.deploy(v1.address, admin.address, calldata);
  await proxy.deployed();

  const proxyContract = await ethers.getContractAt(
    "VendingMachineV1",
    proxy.address
  );

  return {
    v1: v1,
    proxy: proxyContract,
  };
}

async function v2Deployed() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const admin = signers[1];

  const V1 = await ethers.getContractFactory("VendingMachineV1", deployer);
  const v1 = await V1.deploy();
  await v1.deployed();

  const Proxy = await ethers.getContractFactory(
    "TransparentUpgradeableProxy",
    deployer
  );

  const ABI = ["function initialize(uint)"];
  const interface = new ethers.utils.Interface(ABI);
  const calldata = interface.encodeFunctionData("initialize", [74]);
  const proxy = await Proxy.deploy(v1.address, admin.address, calldata);
  await proxy.deployed();

  const proxyContract = await ethers.getContractAt(
    "VendingMachineV1",
    proxy.address
  );

  const V2 = await ethers.getContractFactory("VendingMachineV2", deployer);
  const v2 = await V1.deploy();
  await v2.deployed();

  return {
    v1: v1,
    proxy: proxyContract,
    v2,
  };
}

module.exports = {
  initialFixture,
  v2Deployed,
};
