function convertforwasm() {
    const num_points = points.length;
    const num_segments = segments.length;

    let points_x = [];
    let points_y = [];

    for (let i = 0; i < num_points; i++) {
        points_x.push(points[i].coords.usrCoords[1]);
        points_y.push(points[i].coords.usrCoords[2]);
    }

    let segments_flat = [];

    for (let i = 0; i < num_segments; i++) {
        let p1, p2;
        for (let j = 0; j < num_points; j++) {
            if (segments[i].point1 === points[j]) p1 = j;
            if (segments[i].point2 === points[j]) p2 = j;
        }
        segments_flat.push(p1, p2);
    }

    points_x = new Float64Array(points_x);
    points_y = new Float64Array(points_y);
    segments_flat = new Int32Array(segments_flat);

    return {num_points: num_points, points_x: points_x, points_y: points_y, num_segments: num_segments, segments_flat: segments_flat}
}
