const { networkConfig, autoFundCheck } = require('../../helper-hardhat-config')
const chai = require('chai')
const {expect} = require('chai')
const BN = require('bn.js')
const { getChainId } = require('hardhat')
chai.use(require('chai-bn')(BN))

describe('APIConsumer Unit Tests', async function () {

  let apiConsumer, linkToken

  beforeEach(async () => {
    let chainId = await getChainId()
    await deployments.fixture(['mocks', 'api'])
    const LinkToken = await deployments.get('LinkToken')
    linkToken = await ethers.getContractAt('LinkToken', LinkToken.address)
    const networkName = networkConfig[chainId]['name']

    linkTokenAddress = linkToken.address
    additionalMessage = " --linkaddress " + linkTokenAddress

    const APIConsumer = await deployments.get('APIConsumer')
    apiConsumer = await ethers.getContractAt('APIConsumer', APIConsumer.address)

    let autoFund = await autoFundCheck(apiConsumer.address, networkName, linkTokenAddress, additionalMessage)
    if (autoFund == true) {
        await hre.run("fund-link",{contract: apiConsumer.address, linkaddress: linkTokenAddress})
    }
  })

  it('Should successfully make an API request', async () => {
    const transaction = await apiConsumer.requestVolumeData()
    const tx_receipt = await transaction.wait()
    const requestId = tx_receipt.events[0].topics[1]

    console.log("requestId: ", requestId)
    expect(requestId).to.not.be.null
  })
})