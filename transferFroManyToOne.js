/*
 * @Author: Yulin
 * @Date: 2022-09-27 12:22:22
 * @FilePath: \tools\transferFroManyToOne.js
 * @Description: 批量转账主币多转一 支持eth bsc
 */
const Web3 = require('web3');
const readlineSync = require('readline-sync');

var BN;
var web3;
var accept;

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
        print('请输入转账账户私钥,输入"y"停止');
        const pKey = readlineSync.question();
        if (pKey.length == 64) {
            const account = web3.eth.accounts.privateKeyToAccount(pKey);
            web3.eth.accounts.wallet.add(account);
            continue;
        } else if (pKey.toLocaleLowerCase() == "y") {
            break;
        }
        print("输入格式不正确,请重新输入");
    }
    while (true) {
        print('请输入接受者地址');
        const add = readlineSync.question();
        if (add.length == 42) {
            accept = add;
            break;
        }
        print("输入格式不正确,请重新输入");
    }
    if (web3.eth.accounts.wallet.length == 0) {
        print("最少输入一个转账地址")
        return;
    }
    print("请输入单个转账就金额(gas+金额,单位:Ether),0为转移全部余额");
    main(readlineSync.question());
}

/**
 * 遍历转账
 */
async function main(amount) {
    for (let i = 0; i < web3.eth.accounts.wallet.length; i++) {
        const account = web3.eth.accounts.wallet[i];
        await sendTransaction(account, amount);
    }
}

/**
 * 转账方法
 */
async function sendTransaction(account, amount) {
    var value = amount == "0" ? new BN(await web3.eth.getBalance(account.address)) : new BN(await web3.utils.toWei(amount));
    console.log(value.toString());
    let gas = await web3.eth.estimateGas({
        from: account.address,
        to: accept,
        value
    });
    value = value.sub(new BN(gas).mul(new BN(await web3.eth.getGasPrice())));
    console.log(value.toString());
    web3.eth.sendTransaction({
        from: account.address,
        to: accept,
        value,
        gas
    }, function (error, hash) {
        if (error) {
            print(account.address + ": 转账失败", error);
        } else {
            print(account.address + ": 转账成功,成功Hash: " + hash)
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