all: build

build:
	npm install --production=false
	npm run build

test:
	echo "No tests"

