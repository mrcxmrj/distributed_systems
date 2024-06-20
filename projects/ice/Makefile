.PHONY: client server

all: client server

client:
	slice2py --output-dir client/ slice/demo.ice

server:
	mkdir server/generated
	slice2java --output-dir server/generated slice/demo.ice

clean:
	rm -rf client/demo_ice.py client/Demo server/generated
