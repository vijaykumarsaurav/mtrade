.PHONY: all build clean

ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

all: build

build:
	@echo "Building/Compiling application"
	rm -rf build
	docker run npm run build


clean:
	@echo "Cleaning up..."
	#rm -rf build
