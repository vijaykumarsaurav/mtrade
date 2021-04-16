.PHONY: all build clean

ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

all: build

build:
	@echo "Building/Compiling application"
	rm -rf build
	docker run -i --rm -v $(ROOT_DIR):/app -w /app -e https_proxy=http://appproxy.airtel.com:4145 -e http_proxy=http://appproxy.airtel.com:4145 core.harbor.cloudapps.okdcloud.india.airtel.itm/library/node:lts-stretch npm run docker-build-ui


clean:
	@echo "Cleaning up..."
	rm -rf build
