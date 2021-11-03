const areRectanglesOverlap = (rect1, rect2) => {
  let [left1, top1, right1, bottom1] = [rect1[0], rect1[1], rect1[2], rect1[3]],
      [left2, top2, right2, bottom2] = [rect2[0], rect2[1], rect2[2], rect2[3]];
  // The first rectangle is under the second or vice versa
  if (top1 < bottom2 || top2 < bottom1) {
    return false;
  }
  // The first rectangle is to the left of the second or vice versa
  if (right1 < left2 || right2 < left1) {
    return false;
  }
  // Rectangles overlap
  return true;
};

function overlaps(a, b) {
	// no horizontal overlap
	if (a.x1 >= b.x2 || b.x1 >= a.x2) return false;

	// no vertical overlap
	if (a.y1 >= b.y2 || b.y1 >= a.y2) return false;

	return true;
}