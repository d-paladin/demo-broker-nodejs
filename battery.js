const zmq = require("zeromq");
const protobuf = require("protobufjs");

async function runBattery() {
  // load the protobuf schema
  const root = await protobuf.load("zmqmessage.proto");
  const ZMQMessage = root.lookupType("ZMQMessage");

  // create a subscriber socket to receive network events
  const sub = new zmq.Subscriber;
  sub.connect("tcp://localhost:3002");
  // subscribe to the network emergency event topic
  sub.subscribe("network.event.emergencyrth");
  console.log("battery service subscribed to 'network.event.emergencyrth'");

  // create a publisher socket to send battery status messages
  const pub = new zmq.Publisher;
  pub.connect("tcp://localhost:3001");
  console.log("battery service connected to broker for publishing");

  // process incoming network event messages
  for await (const [topicFrame, messageFrame] of sub) {
    const topic = topicFrame.toString();
    console.log(`battery service received event on topic: ${topic}`);

    // generate a random number for battery charge level (0 to 100)
    const chargeLevel = Math.floor(Math.random() * 101);

    // 1. publish battery.status.chargelevel with random payload
    const payload1 = { topic: "battery.status.chargelevel", payload: chargeLevel };
    const errMsg1 = ZMQMessage.verify(payload1);
    if (errMsg1) throw Error(errMsg1);
    const messageBuffer1 = ZMQMessage.encode(ZMQMessage.create(payload1)).finish();
    await pub.send(["battery.status.chargelevel", messageBuffer1]);
    console.log(`battery service published 'battery.status.chargelevel' with payload ${chargeLevel}`);

    // 2. publish battery.status.chargereachhome with payload 20
    const payload2 = { topic: "battery.status.chargereachhome", payload: 20 };
    const errMsg2 = ZMQMessage.verify(payload2);
    if (errMsg2) throw Error(errMsg2);
    const messageBuffer2 = ZMQMessage.encode(ZMQMessage.create(payload2)).finish();
    await pub.send(["battery.status.chargereachhome", messageBuffer2]);
    console.log("battery service published 'battery.status.chargereachhome' with payload 20");
  }
}

runBattery();
