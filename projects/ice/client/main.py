import sys

import Ice

import Demo

ENDPOINTS = "tcp -h 127.0.0.2 -p 10000 -z : udp -h 127.0.0.2 -p 10000 -z"


def handle_get_data(communicator):
    base = communicator.stringToProxy(f"shared/get:{ENDPOINTS}")
    try:
        data = Demo.DataPrx.checkedCast(base).getData()
        print(f"Response: {data}")
    except Exception as e:
        print(f"Error: {e}")


def handle_add(communicator, value):
    base = communicator.stringToProxy(f"dedicated/{value}:{ENDPOINTS}")
    try:
        data = Demo.CounterPrx.checkedCast(base).addToCounter(value)
        print(f"Response: {data}")
    except Exception as e:
        print(f"Error: {e}")


def handle_exit(communicator, status_code):
    communicator.destroy()
    sys.exit(status_code)


def request_loop(communicator, args):
    if len(args) not in [1, 2]:
        print("wrong number of arguments")
        handle_exit(communicator, 1)
    if args[0] == "data":
        handle_get_data(communicator)
    elif args[0] == "add":
        try:
            value = int(args[1])
            handle_add(communicator, value)
        except:
            print("wrong value")
            handle_exit(communicator, 1)
    else:
        print("command not recognized")
        handle_exit(communicator, 1)
    args_line = input("> ")
    request_loop(communicator, args_line.split(" "))


if __name__ == "__main__":
    communicator = Ice.initialize()
    args = sys.argv[1:]
    try:
        request_loop(communicator, args)
    except KeyboardInterrupt:
        handle_exit(communicator, 0)
