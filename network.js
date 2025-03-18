const zmq = require("zeromq");
const { updateGimbalFeedback, updateDroneMode } = require('./firebase');
const protobuf = require("protobufjs");

async function runNetwork() {
  // Load the GimbalSpeed protobuf definition
  const root = await protobuf.load("zmq_tests/proto/drone_mode.proto");
  const DroneMode = root.lookupType("DroneMode");

  // create a subscriber socket to receive messages
  const sub = new zmq.Subscriber;
  sub.connect("tcp://localhost:5556");
  sub.subscribe(""); // subscribe to all messages
  console.log("network service subscribed to messages on port 5556");

  // process incoming messages
  for await (const [messageFrame] of sub) {
    console.log("Received a message frame");
    const message = messageFrame.toString(); // Convert the message frame to a string
    console.log(`network service received message:`, message);

    // Update Firebase with the received data
    //await updateGimbalFeedback({ topic: "Message", data: message }); // Sends the message as a string
    const decoded = DroneMode.decode(messageFrame); // Decodes the buffer into a JSON object
    //console.log(`network service received GimbalSpeed message:`, decoded);

    // Update Firebase with the received data
    await updateDroneMode({ topic: "DroneMode", ...decoded }); // Sends the decoded JSON object
    console.log(`Updated Firebase with DroneMode data:`, decoded);
  }
}

runNetwork();
