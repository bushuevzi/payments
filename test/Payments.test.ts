import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

describe("Payments", function(){
    let account1: Signer;
    let account2: Signer;
    let payments: Contract;

    beforeEach(async function () {
        [account1, account2] = await ethers.getSigners();
        const Payments = await ethers.getContractFactory("Payments", account1);
        payments = await Payments.deploy();
        await payments.deployed();
    })

    it("should have valid address", async () => {
        expect(payments.address).to.be.properAddress;
    })

    it("should have 0 ether by default", async () => {
        const balance = await payments.currentBalance();
        expect(balance).to.eq(0);
    })

    it("shoud be possible to send funds",async () => {
        const funds = 100;
        const msg = "Test payment";
        const transaction = await payments.connect(account2).pay(msg, { value: funds })

        await expect(() => transaction)
            .to.changeEtherBalances([account2, payments], [-funds, funds]);
        await transaction.wait();     
        
        const account2Address = await account2.getAddress();
        const newPayment = await payments.getPayment(account2Address, 0);
        expect(newPayment.message).to.eq(msg)
        expect(newPayment.amount).to.eq(funds)
        expect(newPayment.from).to.eq(account2Address)
    })
})