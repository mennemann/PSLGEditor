cmake_minimum_required(VERSION 3.10)
project(WASM LANGUAGES CXX)

# set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

# Set C++ standard
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include directories
include_directories(include/)

# Add executable
FILE(GLOB SOURCES src/*.cpp)
add_executable(main ${SOURCES})
