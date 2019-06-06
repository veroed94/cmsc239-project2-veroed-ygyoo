import React from 'react';
import {csv} from 'd3-fetch';
import {json} from 'd3';
import {mickey} from './example-chart';
import {select} from 'd3-selection';
import {transition} from 'd3-transition';
import {symbol, symbolTriangle} from 'd3-shape';


class RootComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      data: null,
      loading: true
    };
  }

  componentWillMount() {
    csv('data/sample-data.csv')
      .then(data => {
        this.setState({
          data,
          loading: false
        });
      });
  }

  render() {
    const {loading, data} = this.state;
    if (loading) {
      return <h1>LOADING</h1>;
    }
    return (
      <h2> I am testing </h2>
    );
  }
}
RootComponent.displayName = 'RootComponent';
export default RootComponent;




const width = 500;
const height = 500;

const margin = width * 0.05;
const innerWidth = width - 2 * margin;
const innerHeight = height - 2 * margin;

const svg = select('#vis')
  .append('svg')
  .attr('id', 'mainvis')
  .attr('width', width)
  .attr('height', height)
  .attr('margin', 'auto')
  .attr('align', 'center')

/* 버튼 조정하는 법
select("#centroid")
  .style('padding', '.5em .8em')
  .style('background-color', 'blue')
  .style('color', 'white')
  .style('font-size', '16px')
*/
const background = svg.append('g')
  .style('transform', 'translate(5%, 5%)')

const dataGroup = background.append('g');
const centroidGroup = background.append('g');
const lineGroup = background.append('g');
let clusters = [];
let dataPoints = [];

function wipeOut() {
  clusters = [];
  dataPoints = [];
}

function updateCentroid() {
  const origCenter = [];
  const newCenter = [];
  clusters.forEach(function(group, i) {
    if (group.dataPoints.length == 0)
      return;

    origCenter.push(group.center.x)
    origCenter.push(group.center.y)

    let x = 0;
    let y = 0;

    group.dataPoints.forEach(function allocate(point) {
      x += point.x;
      y += point.y;
    });
    group.center = {
      x: x / group.dataPoints.length,
      y: y / group.dataPoints.length
    };
    newCenter.push(group.center.x)
    newCenter.push(group.center.y)
  });

  if (compareResult(origCenter, newCenter)) {
    alert('Converged!')
  }
  select("#cent1").attr("disabled", "disabled");
  select("#cent2").attr("disabled", "disabled");
  select("#clust1").attr("disabled", null);
  select("#clust2").attr("disabled", null);
}
function compareResult(origL, newL) {
  let checker = true;
  for (let i = 0; i < origL.length; i++) {
    if (origL[i] != newL[i]) {
      checker = false
    }
  }
  return checker;
}

function updateCluster() {
  clusters.forEach(function update(g) {
    g.dataPoints = [];
  });

  dataPoints.forEach(function regroup(point) {
    let min = Infinity;
    let group;
    clusters.forEach(function closest(c) {
      const distance = Math.pow(c.center.x - point.x, 2) + Math.pow(c.center.y - point.y, 2);
      if (distance < min) {
        min = distance;
        group = c;
      }
    });

    group.dataPoints.push(point);
    point.group = group;
  });
  select("#cent1").attr("disabled", null);
  select("#cent2").attr("disabled", null);
  select("#clust1").attr("disabled", "disabled");
  select("#clust2").attr("disabled", "disabled");
}

function draw() {
  let dataMarks = dataGroup.selectAll('circle')
    .data(dataPoints);
  dataMarks
    .enter()
    .append('circle');
  dataMarks.exit().remove();
  dataMarks
    .transition()
    .duration(1000)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', 5)
    .attr('fill', d => d.group ? d.group.color : 'black');

  if (dataPoints[0].group.center) {
    let l = lineGroup.selectAll('line')
      .data(dataPoints);
    let updateLine = function drawLines(line) {
      line
        .attr('x1', d => d.x)
        .attr('y1', d => d.y)
        .attr('x2', d => d.group.center.x)
        .attr('y2', d => d.group.center.y)
        .attr('stroke', d => d.group.color);
    };

    updateLine(l.enter().append('line'));
    updateLine(l.transition().duration(1000));
    l.exit().remove();
  } else {
    lineGroup.selectAll('line').remove();
  }

  const c = centroidGroup.selectAll('path')
    .data(clusters);

  let drawCenter = function drawCenters(center) {
    center
      .attr('transform', function loc(d) {
        return 'translate(' + d.center.x + ',' + d.center.y +') rotate(45)';
      })
      .attr('fill', function(d, i) {
        return d.color;
      })
      .attr('stroke', 'black');
  };
  c.exit().remove();
  drawCenter(c.enter()
    .append('path')
    .attr('d', symbol().type(symbolTriangle))
    .attr('stroke', 'black'));
  drawCenter(c.transition().duration(1000));
}

function initData() {
  const n = parseInt(select('#n')._groups[0][0].value, 10);
  dataPoints = [];
  let i = 0;
  for (i = 0; i < n; i++) {
    let point = {
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      group: undefined
    };
    point.init = {
      x: point.x,
      y: point.y,
      group: point.group
    };
    dataPoints.push(point);
  }
}

function initCentroid() {
  const k = parseInt(select('#k')._groups[0][0].value, 10);
  clusters = [];
  let i = 0;
  for (i; i < k; i++) {
    let g = {
      points: [],
      color: 'hsl(' + (i * 360 / k ) + ', 100%, 50%)',
      center: {
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight
      },
      init: {
        center: {}
      }
    };
    g.init.center = {
      x: g.center.x,
      y: g.center.y
    };
    clusters.push(g);
  }
}

function mickeyMouse() {
  dataPoints = [];
  clusters = [];
  let i = 0;
  let j = 0;
  const k = mickey.centroid.length
  for (i = 0; i < k; i++) {
    let n = mickey.points[i].length
    for (j = 0; j < n; j++) {
      let point = {
        x: mickey.points[i][j][0] * innerWidth,
        y: mickey.points[i][j][1] * innerHeight,
        group: {color: 'hsl(' + (i * 360 / k) + ', 100%, 50%)'
        }
      };
      point.init = {
        x: point.x,
        y: point.y,
        group: point.group
      };
      dataPoints.push(point);
    }

    let g = {
      points: [],
      color: 'hsl(' + (i * 360 / k) + ', 100%, 50%)',
      center: {
        x: mickey.centroid[i][0] * innerWidth,
        y: mickey.centroid[i][1] * innerHeight
      },
      init: {
        center: {}
      }
    };
    g.init.center = {
      x: g.center.x,
      y: g.center.y
    };
    clusters.push(g);
  }
};

select('#cent1').on('click', function() {updateCentroid(); draw(); });
select('#clust1').on('click', function() {updateCluster(); draw(); });
select('#new1').on('click', function() {wipeOut(); mickeyMouse(); draw(); });
select('#gen1').on('click', function() {initCentroid(); draw(); });
select('#cent2').on('click', function() {updateCentroid(); draw(); });
select('#clust2').on('click', function() {updateCluster(); draw(); });

initData(); draw();
