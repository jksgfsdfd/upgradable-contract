const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const fixtures = require("./fixtures");

describe("Proxy", function () {
  it("Has run the initializer correctly", async function () {
    const { v1, proxy } = await loadFixture(fixtures.initialFixture);
    const deployer = await ethers.getSigner();
    expect(await proxy.numSodas()).to.not.equal(100);
    expect(await proxy.owner()).to.equal(deployer.address);
  });

  it("updates corrects", async function () {
    const { v1, proxy } = await loadFixture(fixtures.initialFixture);
    const signers = await ethers.getSigners();
    const random = signers[5];
    const tx = await proxy
      .connect(random)
      .purchaseSoda({ value: ethers.utils.parseEther("1") });
    await tx.wait();
    const balance = await ethers.provider.getBalance(proxy.address);
    expect(await proxy.numSodas()).to.equal(73);
    expect(balance.toString()).to.equal(ethers.utils.parseEther("1"));
  });

  it("disallows initialising twice", async function () {
    const { v1, proxy } = await loadFixture(fixtures.initialFixture);
    const signers = await ethers.getSigners();
    const random = signers[5];

    await expect(proxy.connect(random).initialize(100)).to.be.reverted;
  });

  it("enforces admin", async function () {
    const { proxy } = await loadFixture(fixtures.initialFixture);
    const signers = await ethers.getSigners();
    const admin = signers[1];
    const random = signers[9];

    const realProxy = await ethers.getContractAt(
      "TransparentUpgradeableProxy",
      proxy.address
    );

    await expect(realProxy.connect(random).admin()).to.be.reverted;
    expect(await realProxy.connect(admin).callStatic.admin()).to.equal(
      admin.address
    );
  });

  it("allows upgrading", async function () {
    const { v1, v2, proxy } = await loadFixture(fixtures.v2Deployed);
    const signers = await ethers.getSigners();
    const admin = signers[1];

    const realProxy = await ethers.getContractAt(
      "TransparentUpgradeableProxy",
      proxy.address
    );

    expect(await realProxy.connect(admin).callStatic.implementation()).to.equal(
      v1.address
    );
    const tx = await realProxy.connect(admin).upgradeTo(v2.address);
    await tx.wait();
    expect(await realProxy.connect(admin).callStatic.implementation()).to.equal(
      v2.address
    );
  });

  it("disallows reinitializing by calling the initializae function", async function () {
    const { v1, v2, proxy } = await loadFixture(fixtures.v2Deployed);
    const signers = await ethers.getSigners();
    const admin = signers[1];

    const realProxy = await ethers.getContractAt(
      "TransparentUpgradeableProxy",
      proxy.address
    );

    expect(await realProxy.connect(admin).callStatic.implementation()).to.equal(
      v1.address
    );

    const ABI = ["function initialize(uint)"];
    const interface = new ethers.utils.Interface(ABI);
    const calldata = interface.encodeFunctionData("initialize", [1234]);

    await expect(
      realProxy.connect(admin).upgradeToAndCall(v2.address, calldata)
    ).to.be.reverted;
  });
});
