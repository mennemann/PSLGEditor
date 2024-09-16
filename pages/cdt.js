function cdt() {
    let w = convertforwasm()

    const points_x_ptr = Module._malloc(
        w.points_x.length * w.points_x.BYTES_PER_ELEMENT
    );
    const points_y_ptr = Module._malloc(
        w.points_y.length * w.points_y.BYTES_PER_ELEMENT
    );
    const segments_flat_ptr = Module._malloc(
        w.segments_flat.length * w.segments_flat.BYTES_PER_ELEMENT
    );

    Module.HEAPF64.set(w.points_x, points_x_ptr / w.points_x.BYTES_PER_ELEMENT);
    Module.HEAPF64.set(w.points_y, points_y_ptr / w.points_y.BYTES_PER_ELEMENT);
    Module.HEAP32.set(
        w.segments_flat,
        segments_flat_ptr / w.segments_flat.BYTES_PER_ELEMENT
    );

    Module._cdt(
        w.num_points,
        points_x_ptr,
        points_y_ptr,
        w.num_segments,
        segments_flat_ptr
    );

    Module._free(points_x_ptr);
    Module._free(points_y_ptr);
    Module._free(segments_flat_ptr);
}
