#ifndef Geometry_H
#define Geometry_H

#include <string>

struct Point {
    int id;
    double x, y;

    std::string str() {
        return "[" + std::to_string(x) + "," + std::to_string(y) + "]";
    }
};

struct Segment {
    int id;
    Point p1, p2;

    std::string str() {
        return p1.str() + " --- " + p2.str();
    }
};

struct Triangle {
    int p1, p2, p3;
};

struct Angle {
    int p1, anchor, p2;
};


inline void populate_data_structures(int num_points, double* points_x, double* points_y, int num_segments, int* segments_flat, Point* points, Segment* segments) {
    for (int i = 0; i < num_points; i++) {
        points[i] = {i, points_x[i], points_y[i]};
    }

    for (int i = 0; i < num_segments; i++) {
        segments[i] = {i, points[segments_flat[i * 2]], points[segments_flat[i * 2 + 1]]};
    }
}

#endif
