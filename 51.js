// All architectural points connected by straight lines.
function flatten(a) {
  return [].concat.apply([], a);
}

function sameSign(a, b) {
  return a * b > 0;
}

function samePoint([a, b]) {
  let e = 0.0001;
  let res = Math.abs(a.x - b.x) < e && Math.abs(a.y - b.y) < e;
  return res;
  
}
function intersect([wA, wB], [rA, rB]) {
  if (
    samePoint([wA, rA]) ||
    samePoint([wA, rB]) ||
    samePoint([wB, rA]) ||
    samePoint([wB, rB])
  ) {
    return false;
  }
  let x1 = wA.x;
  let y1 = wA.y;
  let x2 = wB.x;
  let y2 = wB.y;
  let x3 = rA.x;
  let y3 = rA.y;
  let x4 = rB.x;
  let y4 = rB.y;
  var a1, a2, b1, b2, c1, c2;
  var r1, r2, r3, r4;
  var denom, offset, num;
  // Compute a1, b1, c1, where line joining points 1 and 2
  // is "a1 x + b1 y + c1 = 0".
  a1 = y2 - y1;
  b1 = x1 - x2;
  c1 = x2 * y1 - x1 * y2;
  // Compute r3 and r4.
  r3 = a1 * x3 + b1 * y3 + c1;
  r4 = a1 * x4 + b1 * y4 + c1;
  // Check signs of r3 and r4. If both point 3 and point 4 lie on
  // same side of line 1, the line segments do not intersect.
  if (r3 !== 0 && r4 !== 0 && sameSign(r3, r4)) {
    return 0; //return that they do not intersect
  }
  // Compute a2, b2, c2
  a2 = y4 - y3;
  b2 = x3 - x4;
  c2 = x4 * y3 - x3 * y4;
  // Compute r1 and r2
  r1 = a2 * x1 + b2 * y1 + c2;
  r2 = a2 * x2 + b2 * y2 + c2;
  // Check signs of r1 and r2. If both point 1 and point 2 lie
  // on same side of second line segment, the line segments do
  // not intersect.
  if (r1 !== 0 && r2 !== 0 && sameSign(r1, r2)) {
    return 0; //return that they do not intersect
  }

  return true; //lines intersect, return true
}

let xmlns = "http://www.w3.org/2000/svg";

let svg = document.createElementNS(xmlns, "svg");
let width = document.body.getBoundingClientRect().width;
let height = Math.max(
  document.body.getBoundingClientRect().height,
  document.body.scrollHeight,
  window.innerHeight,
);
svg.id = "drawing51";
svg.style = `
border: 1px solid blue;
position:absolute;
top:0;
left:0;
z-index:999999;
pointer-events:none;
`;
svg.setAttributeNS(null, "width", width);
svg.setAttributeNS(null, "height", height);
svg.setAttributeNS(null, "viewBox", "0 0 " + width + " " + height);

document.body.append(svg);
let wall = document.getElementById("drawing51");

function features() {
  let all = document.querySelectorAll("div,img,svg,iframe,table,canvas, h1");
  return Array.prototype.slice.call(all);
}

function points(elements) {
  return elements
    .sort((a, b) => {
      let { width, height } = a.getBoundingClientRect();
      let va = width * height;
      let br = b.getBoundingClientRect();
      let vb = br.width * br.height;
      return vb - va;
    })
    .filter(el => {
      let { width, height } = el.getBoundingClientRect();
      return width > 50 && height > 50;
    })
    .map(el => {
      let {
        x,
        y,
        width,
        height,
        bottom,
        top,
        left,
        right
      } = el.getBoundingClientRect();
      
      top +=window.scrollY;
      bottom +=window.scrollY;
      
      let sx = window.pageXoffset || 0;
      let sy = window.pageYoffset || 0;
      // console.log(left,sx)
      // let edges
      let corners = [
        { x: left + sx, y: top + sy },
        { x: left + sx, y: bottom + sy },
        { x: right + sx, y: bottom + sy },
        { x: right + sx, y: top + sy }
      ];
      let edges = [
        [corners[0], corners[1]],
        [corners[1], corners[2]],
        [corners[2], corners[3]],
        [corners[3], corners[0]]
      ];
      return corners.map(({ x, y }) => {
        return { x, y, edges };
      });
    });
}

let ps = points(features());
ps = flatten(ps);

function pairings(ps) {
  let pps = [];
  let p;
  for (var i = 0; i < ps.length; i++) {
    p = ps.pop();
    for (var j = 0; j < ps.length; j++) {
      pps.push([p, ps[j]]);
    }
  }

  return pps;
}

function validpairing([a, b]) {
  let apoints = flatten(a.edges);
  let samesqaure = a.edges.every(([a1, a2], i) => {
    let [b1, b2] = b.edges[i];
    return samePoint([a1, b1]) && samePoint([a2, b2]);
  });

  if (samesqaure) {
    return a.x == b.x || a.y == b.y;
  }

  let edges = a.edges.concat(b.edges);

  let cross = edges.find(e => intersect([a, b], e));
  return cross === undefined;
}

let pairs = pairings(ps);
let goodpairs = pairs.filter(validpairing);

function snapline([a, b], color) {
  let l = document.createElementNS(xmlns, "line");
  l.setAttributeNS(null, "x1", a.x);
  l.setAttributeNS(null, "y1", a.y);
  l.setAttributeNS(null, "x2", b.x);
  l.setAttributeNS(null, "y2", b.y);
  l.style = `
    stroke-width:1;
    stroke:${color};
    opacity:0.15`;
  wall.appendChild(l);
}

function draft(lines, color) {
  if (lines.length) {
    setTimeout(() => {
      snapline(lines.pop(), color);
      draft(lines, color);
    }, 1);
  }
}

draft(goodpairs, "blue");
// let badpairs = pairs.filter(a => !validpairing(a));
// draft(badpairs, 'red')
