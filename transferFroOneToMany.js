/*
 * @Author: Yulin
 * @Date: 2022-09-27 12:22:22
 * @FilePath: \tools\transferFroOnetoMany.js
 * @Description: 批量转账主币一对多 支持eth bsc
 */
const Web3 = require('web3');
const readlineSync = require('readline-sync');

var BN;
var web3;
var acceptArr = [];

print("尽量使用源码，不对使用者安全负责,无法保证没有bug");
print("开源地址:https://github.com/yulin19970210/tools");
print("代码水平较差,欢迎提出任何优化建议");


/**
 * 初始化配置
 * @returns 
 */
async function init() {
    print("请选择主网(eth/bsc)")
    const evm = readlineSync.question();
    if (evm.toLowerCase() == "ETH") {
        web3 = new Web3("https://rpc.ankr.com/eth");
    } else {
        web3 = new Web3("https://bsc-dataseed4.ninicoin.io")
    }

    BN = web3.utils.BN;
    while (true) {
        print("请输入转账账户私钥");
        const pKey = readlineSync.question();
        if (pKey.length == 64) {
            const account = web3.eth.accounts.privateKeyToAccount(pKey);
            web3.eth.accounts.wallet.add(account);
            break;
        }
        print("输入格式不正确,请重新输入");
    }
    while (true) {
        print('请输入接受者地址,输入"y"停止');
        const add = readlineSync.question();
        if (add.length == 42) {
            acceptArr.push(add);
            continue;
        } else if (add.toLowerCase() == "y") {
            break;
        }
        print("输入格式不正确,请重新输入");
    }
    if (acceptArr.length == 0) {
        print("最少输入一个接受地址")
        return;
    }
    print("请输入单个转账就金额(单位:Ether)");
    const amount = new BN(await web3.utils.toWei(readlineSync.question()));
    const balance = new BN(await web3.eth.getBalance(web3.eth.accounts.wallet[0].address));
    const sum = amount.mul(new BN(acceptArr.length));
    if (balance.lt(sum)) {
        print("余额不支持所有转账金额,请检查");
        return;
    }
    main(amount);
}

/**
 * 遍历转账
 */
async function main(amount) {
    for (let i = 0; i < acceptArr.length; i++) {
        const add = acceptArr[i];
        await sendTransaction(add, amount);

    }
}

/**
 * 转账方法
 */
async function sendTransaction(add, amount) {
    let gas = await web3.eth.estimateGas({
        from: web3.eth.accounts.wallet[0].address,
        to: add,
        value: amount
    });
    web3.eth.sendTransaction({
        from: web3.eth.accounts.wallet[0].address,
        to: add,
        value: amount, 
        gas
    }, function (error, hash) {
        if (error) {
            print(add + ": 转账失败");
        } else {
            print(add + ": 转账成功,成功Hash: " + hash)
        }
    });
}

/**
 * 展示日志
 */
function print(...str) {
    console.log(...str);
}

init();