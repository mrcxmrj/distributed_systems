import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./proto_types/logger";
import { NewLog__Output } from "./proto_types/logger/NewLog";
import { SubscriptionRequest } from "./proto_types/logger/SubscriptionRequest";

const PROTO_PATH = "../proto/logger.proto";
const SERVER_ADDRESS = "localhost:50051";

function main() {
  try {
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });
    const proto = grpc.loadPackageDefinition(
      packageDefinition,
    ) as unknown as ProtoGrpcType;

    const client = new proto.logger.Logger(
      SERVER_ADDRESS,
      grpc.credentials.createInsecure(),
      {
        "grpc.keepalive_timeout_ms": 10000,
      },
    );

    const sources = process.argv.slice(2);
    const subscriptionRequests: SubscriptionRequest[] = sources.map(
      (source) => ({ source: source }),
    );

    subscriptionRequests.forEach((request) => {
      const call = client.subscribe(request);
      handleCall(call);
    });
  } catch (error) {
    console.error(`Error creating gRPC client: ${error}`);
    process.exit(1);
  }
}

function handleCall(call: grpc.ClientReadableStream<NewLog__Output>) {
  call.on("data", (data: NewLog__Output) => {
    printLog(data);
  });
  call.on("end", () => {
    console.log("Connection end");
  });
  call.on("error", (error) => {
    console.error(error);
  });
}

const printLog = (log: NewLog__Output) => {
  console.log(`${log.severity} from ${log.source}:`);
  log.messages.forEach((message) => console.log(` - ${message}`));
};
main();
