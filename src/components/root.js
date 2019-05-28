import React from 'react';
import {csv} from 'd3-fetch';
import ExampleChart from './example-chart';
import {longBlock} from './example-chart';
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
      <div className="relative">
        <h1> Hello Explainable!</h1>
        <div>{`The example data was loaded! There are ${data.length} rows`}</div>
        <ExampleChart data={data}/>
        <div>{longBlock}</div>
      </div>
    );
  }
}
RootComponent.displayName = 'RootComponent';
export default RootComponent;


// From here is my code for testing
const status = false;


const width = 500;
const height = 500;

const svg = select('#kmeans')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

select("#centroid")
  .style('padding', '.5em .8em')
  .style('background-color', 'blue')
  .style('color', 'white')
  .style('font-size', '16px')

const dataGroup = svg.append('g');
const centroidGroup = svg.append('g');
const lineGroup = svg.append('g');
let clusters = [];
let dataPoints = [];

function updateCentroid() {
  clusters.forEach(function(group, i) {
    if (group.dataPoints.length == 0)
      return;

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
  });
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

  if (dataPoints[0].group) {
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

function init() {
  const n = parseInt(select('#n')._groups[0][0].value, 10);
  const k = parseInt(select('#k')._groups[0][0].value, 10);
  clusters = [];
  let i = 0;
  for (i; i < k; i++) {
    let g = {
      points: [],
      color: 'hsl(' + (i * 360 / k ) + ', 100%, 50%)',
      center: {
        x: Math.random() * width,
        y: Math.random() * height
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

  dataPoints = [];

  for (i = 0; i < n; i++) {
    let point = {
      x: Math.random() * width,
      y: Math.random() * height,
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

function restart() {
  cluster.forEach(function rebuild(g) {
    g.dataPoints = [];
    g.center.x = g.init.center.x;
    g.center.y = g.init.center.y;
  });
  let i = 0;
  for (i; i < dataPoints.length; i++) {
    const point = dataPoints[i];
    dataPoints[i] = {
      x: point.init.x,
      y: point.init.y,
      group: undefined,
      init: point.init
    };
  }
}


select('#centroid').on('click', function() {updateCentroid(); draw(); });
select('#cluster').on('click', function() {updateCluster(); draw(); });
select('#generate').on('click', function() {init(); draw(); });


init(); draw();
