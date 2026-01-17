all: build

build:
	blueprint-compiler compile window.blp --output window.ui
	glib-compile-resources index.gresource.xml

run: build
	./main.js
