const zmq = require("zeromq");
const protobuf = require("protobufjs");

async function runNetwork() {
  // load the protobuf schema
  const root = await protobuf.load("zmqmessage.proto");
  const ZMQMessage = root.lookupType("ZMQMessage");

  // create a publisher socket to send network events
  const pub = new zmq.Publisher;
  pub.connect("tcp://localhost:3001");
  console.log("network service connected to broker for publishing");

  // create a subscriber socket to receive battery status updates
  const sub = new zmq.Subscriber;
  sub.connect("tcp://localhost:3002");
  // subscribe to battery.status.chargelevel messages
  sub.subscribe("battery.status.chargelevel");
  console.log("network service subscribed to 'battery.status.chargelevel'");

  // publish a network emergency event every 5 seconds without a payload
  setTimeout(() => {
    setInterval(async () => {
      // publish event code remains the same
      const payload = { topic: "network.event.emergencyrth" };
      const errMsg = ZMQMessage.verify(payload);
      if (errMsg) throw Error(errMsg);
      const messageBuffer = ZMQMessage.encode(ZMQMessage.create(payload)).finish();
      await pub.send(["network.event.emergencyrth", messageBuffer]);
      console.log("network service published 'network.event.emergencyrth'");
    }, 5000);
  }, 2000); // 2 seconds delay

  // process incoming battery status messages
  for await (const [topicFrame, messageFrame] of sub) {
    const topic = topicFrame.toString();
    const decoded = ZMQMessage.decode(messageFrame);
    console.log(`network service received on ${topic}:`, decoded);
  }
}

runNetwork();
