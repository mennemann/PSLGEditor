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

#endif
