.DEFAULT_GOAL := build
.PHONY: build

BIN = $(shell yarn bin)

test:
	${BIN}/firebase emulators:exec --only firestore "${BIN}/jest"
.PHONY: test

test-watch:
	${BIN}/firebase emulators:exec --only firestore "${BIN}/jest --env node --watch"

test-setup:
	${BIN}/firebase setup:emulators:firestore

test-system: test-system-node test-system-browser

test-system-node:
	${BIN}/jest --env node

test-system-node-watch:
	${BIN}/jest --env node --watch

test-system-browser:
	${BIN}/karma start --single-run

test-system-browser-watch:
	${BIN}/karma start

build:
	@rm -rf lib
	@${BIN}/tsc
	@${BIN}/prettier "lib/**/*.[jt]s" --write --loglevel silent
	@cp package.json lib
	@cp *.md lib
	@rsync --archive --prune-empty-dirs --exclude '*.ts' --relative src/./ lib
	@${BIN}/tsc --outDir lib/esm --module es2020 --target es2019
	@cp src/adaptor/package.esm.json lib/esm/adaptor/package.json

publish: build
	cd lib && npm publish --access public

publish-next: build
	cd lib && npm publish --access public --tag next

docs:
	@${BIN}/typedoc --theme minimal --name Typesaurus
.PHONY: docs