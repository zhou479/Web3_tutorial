const { task } = require("hardhat/config");

task("interact-fundme", "interact with fundme contract").addParam("addr", "fundMe contract address").setAction(async (taskArg, hre) => {

    const fundMeFactory = await ethers.getContractFactory("FundMe");
    const fundMe = await fundMeFactory.attach(taskArg.addr);

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
});