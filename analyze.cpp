#include <emscripten.h>

#include <string>

EM_JS(void, console_log, (const char* str), {
    console.log(UTF8ToString(str));
});

struct Analysis {
    int a;
};

extern "C" {

EMSCRIPTEN_KEEPALIVE
Analysis* analyze(int num_points, double* points_x, double* points_y, int num_segments, int* segments_flat) {
    auto segments = new int[num_segments][2];

    for (int i = 0; i < num_segments; i++) {
        segments[i][0] = segments_flat[i * 2];
        segments[i][1] = segments_flat[i * 2 + 1];
    }

    // implement analysis here

    Analysis* result = new Analysis();
    result->a = 42;

    delete[] segments;
    return result;
}
}
