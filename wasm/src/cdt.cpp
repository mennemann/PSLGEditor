#include <emscripten.h>

#include "Geometry.hpp"

#include "CDT.h"

extern "C" {

EMSCRIPTEN_KEEPALIVE
void cdt(int num_points, double* points_x, double* points_y, int num_segments, int* segments_flat) {
    auto points = new Point[num_points];
    auto segments = new Segment[num_segments];

    populate_data_structures(num_points, points_x, points_y, num_segments, segments_flat, points, segments);

    CDT::Triangulation<double> triangulation;

    triangulation.insertVertices(points, points + num_points, [](Point& p) {return p.x;}, [](Point& p) {return p.y;} );
    triangulation.insertEdges(segments, segments + num_segments, [](Segment& s) {return s.p1.id;}, [](Segment& s) {return s.p2.id;});
    triangulation.eraseSuperTriangle();

    auto edges = CDT::extractEdgesFromTriangles(triangulation.triangles);

    for (auto edge : edges) {
        std::pair<int,int> edge_points = edge.verts();
        EM_ASM({ 
            createSegment(points[$0], points[$1])
        }, edge_points.first, edge_points.second);
    }

    delete [] points;
    delete [] segments;
}

}

