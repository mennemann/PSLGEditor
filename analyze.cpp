#include <emscripten.h>

#include <string>
#include <unordered_set>
#include <vector>

using namespace std;

EM_JS(void, console_log, (const char* str), {
    console.log(UTF8ToString(str));
});

EM_JS(void, timerStart, (const char* str), {console.time(UTF8ToString(str))});

EM_JS(void, timerEnd, (const char* str), {console.timeEnd(UTF8ToString(str))});

extern "C" {

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

int orientation(Point p, Point q, Point r) {
    double val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val == 0) return 0;
    return (val > 0) ? 1 : 2;
}

bool onSegment(Point p, Point q, Point r) {
    if (q.x <= std::max(p.x, r.x) && q.x >= std::min(p.x, r.x) &&
        q.y <= std::max(p.y, r.y) && q.y >= std::min(p.y, r.y))
        return true;
    return false;
}

bool doSegmentsIntersect(Segment& s1, Segment& s2) {
    Point p1 = s1.p1, q1 = s1.p2;
    Point p2 = s2.p1, q2 = s2.p2;

    if (p1.id == p2.id || p1.id == q2.id || q1.id == p2.id || q1.id == q2.id) return false;

    // Find the four orientations needed for general and special cases
    int o1 = orientation(p1, q1, p2);
    int o2 = orientation(p1, q1, q2);
    int o3 = orientation(p2, q2, p1);
    int o4 = orientation(p2, q2, q1);

    // General case
    if (o1 != o2 && o3 != o4)
        return true;

    // Special Cases
    // p1, q1 and p2 are collinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are collinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are collinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;

    // p2, q2 and q1 are collinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;

    // Doesn't fall in any of the above cases
    return false;
}

bool existsSegmentInSet(int p1, int p2, unordered_set<int>& S, Segment* segments) {
    for (const auto& i : S) {
        if ((segments[i].p1.id == p1 && segments[i].p2.id == p2) || (segments[i].p1.id == p2 && segments[i].p2.id == p1)) return true;
    }
    return false;
}

bool isPointInTriangle(Triangle T, Point* points, int num_points) {
    double x1 = points[T.p1].x;
    double y1 = points[T.p1].y;

    double x2 = points[T.p2].x;
    double y2 = points[T.p2].y;

    double x3 = points[T.p3].x;
    double y3 = points[T.p3].y;

    for (int i = 0; i < num_points; i++) {
        double x = points[i].x;
        double y = points[i].y;

        double denominator = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
        double u = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / denominator;
        double v = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / denominator;
        double w = 1 - u - v;

        if (0 < u && u < 1 && 0 < v && v < 1 && 0 < w && w < 1) return true;
    }

    return false;
}

EMSCRIPTEN_KEEPALIVE
void analyze(int num_points, double* points_x, double* points_y, int num_segments, int* segments_flat) {
    auto points = new Point[num_points];
    auto segments = new Segment[num_segments];

    for (int i = 0; i < num_points; i++) {
        points[i] = {i, points_x[i], points_y[i]};
    }

    for (int i = 0; i < num_segments; i++) {
        segments[i] = {i, points[segments_flat[i * 2]], points[segments_flat[i * 2 + 1]]};
    }

    timerStart("checking for segment intersections");

    unordered_set<int> crossing_segment_ids;

    for (int i = 0; i < num_segments; i++) {
        for (int j = i + 1; j < num_segments; j++) {
            if (doSegmentsIntersect(segments[i], segments[j])) {
                crossing_segment_ids.insert(i);
                crossing_segment_ids.insert(j);
            }
        }
    }

    unordered_set<int> non_crossing_segment_ids;

    for (int i = 0; i < num_segments; i++) {
        if (crossing_segment_ids.find(i) == crossing_segment_ids.end()) non_crossing_segment_ids.insert(i);
    }

    timerEnd("checking for segment intersections");
    timerStart("generating triangles");

    vector<Triangle> possible_triangles;

    for (int i = 0; i < num_points - 2; i++) {
        for (int j = i + 1; j < num_points - 1; j++) {
            for (int k = j + 1; k < num_points; k++) {
                if (
                    existsSegmentInSet(i, j, non_crossing_segment_ids, segments) &&
                    existsSegmentInSet(j, k, non_crossing_segment_ids, segments) &&
                    existsSegmentInSet(k, i, non_crossing_segment_ids, segments)) {
                    possible_triangles.push_back({i, j, k});
                }
            }
        }
    }

    vector<Triangle> triangles;

    copy_if(possible_triangles.begin(), possible_triangles.end(), back_inserter(triangles), [points, num_points](Triangle T) { return !isPointInTriangle(T, points, num_points); });

    timerEnd("generating triangles");
    timerStart("generating angles");

    vector<Angle> angles;

    for (const auto& triangle : triangles) {
        Point p1 = points[triangle.p1];
        Point p2 = points[triangle.p2];
        Point p3 = points[triangle.p3];

        int o_p1 = orientation(p3, p1, p2);
        if (o_p1 == 1) {
            angles.push_back({p3.id, p1.id, p2.id});
        } else if (o_p1 == 2) {
            angles.push_back({p2.id, p1.id, p3.id});
        }

        int o_p2 = orientation(p1, p2, p3);
        if (o_p2 == 1) {
            angles.push_back({p1.id, p2.id, p3.id});
        } else if (o_p2 == 2) {
            angles.push_back({p3.id, p2.id, p1.id});
        }

        int o_p3 = orientation(p2, p3, p1);
        if (o_p3 == 1) {
            angles.push_back({p2.id, p3.id, p1.id});
        } else if (o_p3 == 2) {
            angles.push_back({p1.id, p3.id, p2.id});
        }
    }

    timerEnd("generating angles");
    timerStart("checking for abandoned segments");

    vector<int> abandoned_segment_ids;
    for (int i = 0; i < num_segments; i++) {
        bool part_of_triangle = false;

        for (const auto& triangle : triangles) {
            if (
                (segments[i].p1.id == triangle.p1 &&
                 segments[i].p2.id == triangle.p2) ||
                (segments[i].p1.id == triangle.p2 &&
                 segments[i].p2.id == triangle.p1) ||
                (segments[i].p1.id == triangle.p1 &&
                 segments[i].p2.id == triangle.p3) ||
                (segments[i].p1.id == triangle.p3 &&
                 segments[i].p2.id == triangle.p1) ||
                (segments[i].p1.id == triangle.p2 &&
                 segments[i].p2.id == triangle.p3) ||
                (segments[i].p1.id == triangle.p3 &&
                 segments[i].p2.id == triangle.p2)) {
                part_of_triangle = true;
                break;
            }
        }
        if (!part_of_triangle) abandoned_segment_ids.push_back(i);
    }

    timerEnd("checking for abandoned segments");
    timerStart("drawing results");

    for (const auto& id : non_crossing_segment_ids) {
        EM_ASM({ segments[$0].setAttribute({color : "green"}); }, id);
    }

    for (const auto& id : crossing_segment_ids) {
        EM_ASM({ segments[$0].setAttribute({color : "red"}); }, id);
    }

    for (const auto& id : abandoned_segment_ids) {
        EM_ASM({ segments[$0].setAttribute({color : "red"}); }, id);
    }

    for (const auto& triangle : triangles) {
        EM_ASM({ 
            points[$0].setAttribute({color: "green"});
            points[$1].setAttribute({color: "green"});
            points[$2].setAttribute({color: "green"});
            triangles.push(board.create("polygon", [ points[$0], points[$1], points[$2] ])); }, triangle.p1, triangle.p2, triangle.p3);
    }

    for (const auto& angle : angles) {
        EM_ASM({
            let a = board.create("angle", [ points[$0], points[$1], points[$2] ]);
            a.setAttribute({
                name: () => {
                    return ((a.Value() * 180) / Math.PI).toFixed(1) + "°";
                },
                color: () => {
            return a.Value() > Math.PI / 2 + 1e-10 ? "red" : "#00FF00";
                }
    });

    angles.push(a);
},angle.p1, angle.anchor, angle.p2);
}

timerEnd("drawing results");
delete[] points;
delete[] segments;
}
}
