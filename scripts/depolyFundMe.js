// import ethers.js
// create main function
// execute main function

const { ethers } = require("hardhat")

async function main() {
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

    // init 2 accounts
    const [firstAccount, secondAccount] = await ethers.getSigners();

    // fund contract with first account
    const fundTx = await fundMe.fund({value: ethers.parseEther("0.5")});
    await fundTx.wait();

    // check balance of contract
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
    console.log(`Balance of contract: ${balanceOfContract}`);
    
    // fund contract wiht second account
    const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({value: ethers.parseEther("0.5")});
    await fundTxWithSecondAccount.wait();

    // check balance of contract
    const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target);
    console.log(`Balance of contract: ${balanceOfContractAfterSecondFund}`);

    // check mapping fundersToAmount
    const firstAccountBalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address);
    const secondAccountBalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address);

    console.log(`Balance of first account ${firstAccount.address} is ${firstAccountBalanceInFundMe}`);
    console.log(`Balance of second account ${secondAccount.address} is ${secondAccountBalanceInFundMe}`);
}
async function verifyFundMe(fundMeAddr, args) {

    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
    });
}
main().then().catch((error) => {
    console.error(error);
    process.exit(1);
})