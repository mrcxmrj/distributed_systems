#!/bin/bash

mkdir -p ./generated
printf "import sys\nfrom pathlib import Path\nsys.path.append(str(Path(__file__).parent))" > ./generated/__init__.py
python3 -m grpc_tools.protoc \
          -I../proto \
          --python_out=./generated \
          --pyi_out=./generated \
          --grpc_python_out=./generated \
          ../proto/logger.proto
