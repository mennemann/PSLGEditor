#include <emscripten.h>

#include "Geometry.hpp"

extern "C" {

EMSCRIPTEN_KEEPALIVE
void cdt(int num_points, double* points_x, double* points_y, int num_segments, int* segments_flat) {
    auto points = new Point[num_points];
    auto segments = new Segment[num_segments];

    populate_data_structures(num_points, points_x, points_y, num_segments, segments_flat, points, segments);

    // do cdt
    EM_ASM({ console.log("in cdt") });

    delete [] points;
    delete [] segments;
}


}