const zmq = require("zeromq");

// function to forward messages from a source socket to a destination socket
async function forward(source, destination) {
  for await (const msg of source) {
    await destination.send(msg);
  }
}

async function runBroker() {
  const xsub = new zmq.XSubscriber;
  const xpub = new zmq.XPublisher;

  await xsub.bind("tcp://*:3001"); // for microservices to publish their messages
  await xpub.bind("tcp://*:3002");  // for microservices to subscribe to messages

  console.log("broker running: XSUB on port 3001, XPUB on port 3002");

  // forward messages in both directions concurrently (bidirectional proxy):
  // 1. forward publisher messages (and subscription messages from subscribers forwarded via xpub)
  //    from xsub to xpub.
  // 2. forward subscription messages from xpub back to xsub.
  await Promise.all([
    forward(xsub, xpub),
    forward(xpub, xsub),
  ]);
}

runBroker();
