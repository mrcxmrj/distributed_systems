import os
import random
import time
from concurrent import futures

from generated import logger_pb2 as pb
from generated import logger_pb2_grpc as pb_grpc

import grpc

SOURCES = {"source1", "source2", "source3"}
SEVERITY_TYPES = [pb.INFO, pb.WARNING, pb.ERROR, pb.CRITICAL]
MESSAGES = [
    "Egzaminów? Widać jednak jakoś bo po próbnym locie nieważki pod zaklęsłymi!",
    "Żelaznej konstrukcji, rura miejscem, z którego można ją na spadochronie.",
    "Wszystkie tablice zegarów, wskaźniki, Gorączkowo poszukiwał w opustoszałej głowie awaryjne, sześć dźwigni przed sklepem człowieka.",
    "Można Cały kurs ryknął jak liny, bo obie ręce miał rakiet, miejscem, z którego?",
]


class LoggerServicer(pb_grpc.LoggerServicer):
    def Subscribe(self, request, context):
        print(f"Subscription request from {context.peer()} for {request.source}")

        if request.source not in SOURCES:
            print(f"Invalid source: {request.source}")
            return
        while context.is_active():
            severity, messages = self.mock_record()
            new_log = pb.NewLog(
                source=request.source, severity=severity, messages=messages
            )
            print(f"Sent notification for {request.source} to {context.peer()}")
            yield new_log
            time.sleep(random.randint(5, 10))

    def mock_record(self):
        severity = random.choice(SEVERITY_TYPES)
        messages_number = random.randint(1, len(MESSAGES))
        messages = [random.choice(MESSAGES) for _ in range(messages_number)]
        return (severity, messages)


class Server:
    def __init__(self):
        self.server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
        pb_grpc.add_LoggerServicer_to_server(LoggerServicer(), self.server)
        self.port = os.environ.get("SERVER_PORT", "50051")
        self.server.add_insecure_port("[::]:" + self.port)

    def start(self):
        self.server.start()
        print(f"Server started, listening on " + self.port)
        self.server.wait_for_termination()


if __name__ == "__main__":
    server = Server()
    server.start()
