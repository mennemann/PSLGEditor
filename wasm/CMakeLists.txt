cmake_minimum_required(VERSION 3.10)
project(WASM LANGUAGES CXX)

# set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/../pages/build/)

# Set C++ standard
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(JS_EXPORTED_FUNCTIONS "['_analyze', '_malloc', '_free']")
set(JS_EXPORTED_RUNTIME_METHODS "['getValue', 'UTF8ToString']")

# Include directories
include_directories(include/)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3")
SET(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -s EXPORTED_FUNCTIONS=\"${JS_EXPORTED_FUNCTIONS}\" -s EXPORTED_RUNTIME_METHODS=\"${JS_EXPORTED_RUNTIME_METHODS}\" -s WASM=1")


# Add executable
FILE(GLOB SOURCES src/*.cpp)
add_executable(wasm ${SOURCES})
