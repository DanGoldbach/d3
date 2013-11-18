import "../core/functor";
import "geom";
import "point";

/**
 * Computes the 2D convex hull of a set of points using Graham's scanning
 * algorithm. The algorithm has been implemented as described in Cormen,
 * Leiserson, and Rivest's Introduction to Algorithms. The running time of
 * this algorithm is O(n log n), where n is the number of input points.
 *
 * @param vertices [[x1, y1], [x2, y2], …]
 * @returns polygon [[x1, y1], [x2, y2], …]
 */
d3.geom.hull = function(vertices) {
  var x = d3_geom_pointX,
      y = d3_geom_pointY;

  if (arguments.length) return hull(vertices);

  function hull(data) {
    // Hull of < 3 points is not well-defined
    if (data.length < 3) return [];

    var fx = d3_functor(x),
        fy = d3_functor(y),
        n = data.length;

    for (i = 0, all_points = []; i < n; ++i) {
      all_points.push([+fx.call(this, d = data[i], i), +fy.call(this, d, i)]);
    }

    // sort ascending by x-coord first, y-coord second
    all_points.sort();

    // find the topmost and bottommost point for each x-coord, respectively.
    // we flip bottommost points across y axis so we can use the upper hull
    // routine on both
    var upper_points = [],
        lower_points = [];
    for (var i = 0; i < n; i++) {
      if (i === 0 || (i > 0 && all_points[i][0] != all_points[i-1][0]))
        upper_points.push(all_points[i]);
      if (i === n-1 || (i < n && all_points[i][0] != all_points[i+1][0]))
        lower_points.push([all_points[i][0], -all_points[i][1]]);
    }

    // get the complete hull with points sorted in ccw order
    var upper_hull = d3_geom_hull_find_upper_hull(upper_points);
    var lower_hull = d3_geom_hull_find_upper_hull(lower_points);
    var hull = []
    for (var i = 0; i < lower_hull.length ; i++)
      hull.push([lower_hull[i][0], -lower_hull[i][1]]);  // undo y axis flip
    for (var i = upper_hull.length - 1; i >= 0 ; i--)
      hull.push(upper_hull[i]);

    return hull;
  }

  hull.x = function(_) {
    return arguments.length ? (x = _, hull) : x;
  };

  hull.y = function(_) {
    return arguments.length ? (y = _, hull) : y;
  };

  return hull;
};

// finds the 'upper convex hull' (see wiki link above)
// assumes points arg has >=3 elements, is sorted by x, unique in y
// returns [[x1, y1], ...] hull points in left to right order
function d3_geom_hull_find_upper_hull(points) {
  var n = points.length,
      hull = [points[0], points[1]],
      hs = 2;  // hull size

  for (var i = 2; i < n; i++) {
    while (hs > 1 && !d3_geom_hull_CW(hull[hs-2], hull[hs-1], points[i])) {
      hs --;
    }
    hull[hs++] = points[i];
  }
  // we slice to make sure that the points we 'popped' from hull don't stay behind
  return hull.slice(0, hs);
}

// are three points a, b, c in clockwise order?
// i.e. is the sign of (b-a)x(c-a) positive?
function d3_geom_hull_CW(a, b, c) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) > 0;
}
