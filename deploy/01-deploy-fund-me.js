// function deployFunction() {
//     console.log("this is a deploy function");
// }
// module.exports.default = deployFunction;

const { network } = require("hardhat");
const { devlopmentChains, networkConfig, LOCK_TIME,CONFIRMATIONS } = require("../helper-hardhat-config");
// module.exports.default = async (hre) => {
//     const getNamedAccounts = hre.getNamedAccounts;
//     const deployments = hre.deployments;
//     console.log("this is a deploy function");
// }

module.exports = async({getNamedAccounts, deployments}) => {
    const { firstAccount } = await getNamedAccounts();
    const { deploy } = deployments;

    let dataFeedAddr;
    let comfirmations;
    if(devlopmentChains.includes(network.name)) {
        const mockV3Aggregator = await deployments.get("MockV3Aggregator");
        dataFeedAddr = mockV3Aggregator.address;
        comfirmations = 0;
    } else {
        dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed;
        comfirmations = CONFIRMATIONS;
    }
    const fundMe = await deploy("FundMe", {
        from: firstAccount,
        args: [LOCK_TIME, dataFeedAddr],
        log: true,
        waitConfirmations: comfirmations
    });

    // remove deployments directory or add --reset flag if you redeploy contract
    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [LOCK_TIME, dataFeedAddr],
        });
    } else {
        console.log("Network is not sepolia, Verifier skipped...");
    }
}

module.exports.tags = ["all", "fundme"];