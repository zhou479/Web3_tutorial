const { task } = require("hardhat/config");

task("deploy-fundme", "deploy and verify fundme contract").setAction(async (taskArg, hre) => {
    // create factory
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    console.log("Deploying contract...");
    // depoly contract
    const fundMe = await fundMeFactory.deploy(300);
    await fundMe.waitForDeployment();
    console.log(`Contract deployed to:", ${fundMe.target}`);

    // verify contract
    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("Wait for 5 blocks...");
        await fundMe.deploymentTransaction().wait(5);
        await verifyFundMe(fundMe.target, [300]);
    } else {
        console.log("Verification skipped...");
    }

});

async function verifyFundMe(fundMeAddr, args) {

    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
    });
}
module.exports = {}