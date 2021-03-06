'use strict';

const Joyso = artifacts.require('./Joyso.sol');
const TestToken = artifacts.require('./testing/TestToken.sol');
const NewJoyso = artifacts.require('./testing/NewJoyso.sol');
const helper = require('./support/helper.js');

contract('test migrate.js', accounts => {
  const admin = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const joysoWallet = accounts[4];

  it('test new version contract', async () => {
    const nc = await NewJoyso.new({ from: admin });
    const token = await TestToken.new('tt', 'tt', 18, { from: admin });
    await token.transfer(user1, helper.ether(1), { from: admin });
    await token.approve(nc.address, helper.ether(1), { from: user1 });

    await nc.migrate(user2, helper.ether(0.5), token.address, { from: user1 });
    const user2TokenBalance = await nc.getBalance(token.address, user2);
    assert.equal(user2TokenBalance, helper.ether(0.5));
  });

  it('combination of new and old contract', async () => {
    const temp = await helper.setupEnvironment();
    const joyso = await Joyso.at(temp[0]);

    const nc = await NewJoyso.new({ from: admin });

    const inputs = [ nc.address ];
    const user1Migrate = await helper.generateMigrate(helper.ether(0.02), 0, 0, user1, joyso.address, nc.address);
    inputs.push(...user1Migrate);

    const user1NcEthBalance0 = await nc.getBalance(0, user1);
    await joyso.migrateByAdmin_DQV(inputs);
    const user1NcEthBalance1 = await nc.getBalance(0, user1);
    assert.equal(user1NcEthBalance1 - user1NcEthBalance0, helper.ether(1 - 0.02));
  });

  it('token migrate', async () => {
    const temp = await helper.setupEnvironment();
    const joyso = await Joyso.at(temp[0]);
    const token = await TestToken.at(temp[1]);

    const nc = await NewJoyso.new({ from: admin });

    const inputs = [ nc.address ];
    const user1Migrate = await helper.generateMigrate(helper.ether(0.02), 0, token.address, user1, joyso.address, nc.address);
    inputs.push(...user1Migrate);

    const user1NcEthBalance0 = await nc.getBalance(token.address, user1);
    await joyso.migrateByAdmin_DQV(inputs);
    const user1NcEthBalance1 = await nc.getBalance(token.address, user1);
    assert.equal(user1NcEthBalance1 - user1NcEthBalance0, helper.ether(1));
  });

  it('token migrate, pay by free', async () => {
    const temp = await helper.setupEnvironment();
    const joyso = await Joyso.at(temp[0]);
    const token = await TestToken.at(temp[1]);

    const nc = await NewJoyso.new({ from: admin });

    const inputs = [ nc.address ];
    const user1Migrate = await helper.generateMigrate(helper.ether(0), 0, token.address, user1, joyso.address, nc.address);
    inputs.push(...user1Migrate);

    const joysoWalletEth = await joyso.getBalance(0, joysoWallet);
    const user1NcEthBalance0 = await nc.getBalance(token.address, user1);
    await joyso.migrateByAdmin_DQV(inputs);
    const user1NcEthBalance1 = await nc.getBalance(token.address, user1);
    const joysoWalletEth2 = await joyso.getBalance(0, joysoWallet);
    assert.equal(user1NcEthBalance1 - user1NcEthBalance0, helper.ether(1));
    assert.equal(joysoWalletEth2 - joysoWalletEth, helper.ether(0));
  });

  it('token migrate, pay by ether', async () => {
    const temp = await helper.setupEnvironment();
    const joyso = await Joyso.at(temp[0]);
    const token = await TestToken.at(temp[1]);

    const nc = await NewJoyso.new({ from: admin });

    const inputs = [ nc.address ];
    const user1Migrate = await helper.generateMigrate(helper.ether(0.02), 0, token.address, user1, joyso.address, nc.address);
    inputs.push(...user1Migrate);

    const joysoWalletEth = await joyso.getBalance(0, joysoWallet);
    const user1NcEthBalance0 = await nc.getBalance(token.address, user1);
    await joyso.migrateByAdmin_DQV(inputs);
    const user1NcEthBalance1 = await nc.getBalance(token.address, user1);
    const joysoWalletEth2 = await joyso.getBalance(0, joysoWallet);
    assert.equal(user1NcEthBalance1 - user1NcEthBalance0, helper.ether(1));
    assert.equal(joysoWalletEth2 - joysoWalletEth, helper.ether(0.02));
  });

  it('token migrate, pay by joy', async () => {
    const temp = await helper.setupEnvironment();
    const joyso = await Joyso.at(temp[0]);
    const token = await TestToken.at(temp[1]);
    const joy = await TestToken.at(temp[2]);

    const nc = await NewJoyso.new({ from: admin });

    const inputs = [ nc.address ];
    const user1Migrate = await helper.generateMigrate(helper.ether(0.02), 1, token.address, user1, joyso.address, nc.address);
    inputs.push(...user1Migrate);

    const joysoWalletEth = await joyso.getBalance(joy.address, joysoWallet);
    const user1NcEthBalance0 = await nc.getBalance(token.address, user1);
    await joyso.migrateByAdmin_DQV(inputs);
    const user1NcEthBalance1 = await nc.getBalance(token.address, user1);
    const joysoWalletEth2 = await joyso.getBalance(joy.address, joysoWallet);
    assert.equal(user1NcEthBalance1 - user1NcEthBalance0, helper.ether(1));
    assert.equal(joysoWalletEth2 - joysoWalletEth, helper.ether(0.02));
  });

  it('token migrate, pay by token', async () => {
    const temp = await helper.setupEnvironment();
    const joyso = await Joyso.at(temp[0]);
    const token = await TestToken.at(temp[1]);

    const nc = await NewJoyso.new({ from: admin });

    const inputs = [ nc.address ];
    const user1Migrate = await helper.generateMigrate(helper.ether(0.02), 2, token.address, user1, joyso.address, nc.address);
    inputs.push(...user1Migrate);

    const joysoWalletEth = await joyso.getBalance(token.address, joysoWallet);
    const user1NcEthBalance0 = await nc.getBalance(token.address, user1);
    await joyso.migrateByAdmin_DQV(inputs);
    const user1NcEthBalance1 = await nc.getBalance(token.address, user1);
    const joysoWalletEth2 = await joyso.getBalance(token.address, joysoWallet);
    assert.equal(user1NcEthBalance1 - user1NcEthBalance0, helper.ether(1 - 0.02));
    assert.equal(joysoWalletEth2 - joysoWalletEth, helper.ether(0.02));
  });

  it('gas consumption ', async () => {
    const temp = await helper.setupEnvironment();
    const joyso = await Joyso.at(temp[0]);

    const nc = await NewJoyso.new({ from: admin });

    let inputs = [ nc.address ];
    const user1Migrate = await helper.generateMigrate(helper.ether(0.02), 0, 0, user1, joyso.address, nc.address);
    inputs.push(...user1Migrate);

    let tx = await joyso.migrateByAdmin_DQV.sendTransaction(inputs, { from: admin });
    let txReceipt = await web3.eth.getTransactionReceipt(tx);
    console.log('1 user migrate cost: ', txReceipt.gasUsed);

    inputs = [ nc.address ];
    const user2Migrate = await helper.generateMigrate(helper.ether(0.02), 0, 0, user2, joyso.address, nc.address);
    const user3Migrate = await helper.generateMigrate(helper.ether(0.02), 0, 0, user3, joyso.address, nc.address);
    inputs.push(...user2Migrate);
    inputs.push(...user3Migrate);
    tx = await joyso.migrateByAdmin_DQV.sendTransaction(inputs, { from: admin });
    txReceipt = await web3.eth.getTransactionReceipt(tx);
    console.log('2 users migrate cost: ', txReceipt.gasUsed);
  });
});
