import React from 'react';
import {csv} from 'd3-fetch';
import {json} from 'd3';
import {examples} from './example-chart';
import {select} from 'd3-selection';
import {transition} from 'd3-transition';
import {symbol, symbolCross} from 'd3-shape';


export function kmeans() {
  config();
}

function config() {
  let clusters = [];
  let dataPoints = [];
  const width = 500;
  const height = 500;
  const margin = width * 0.05;
  const innerWidth = width - 2 * margin;
  const innerHeight = height - 2 * margin;

  let svg = select('#vis')
    .append('svg')
    .attr('id', 'mainvis')
    .attr('width', width)
    .attr('height', height)
    .attr('margin', 'auto')
    .attr('align', 'center');

  let background = svg.append('g')
    .style('transform', 'translate(5%, 5%)')

  let dataGroup = background.append('g');
  let centroidGroup = background.append('g');
  let lineGroup = background.append('g');

  function wipeOut() {
    clusters = [];
    dataPoints = [];
  }

  function updateCentroid() {
    let origCenter = [];
    let newCenter = [];
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
  };

  function compareResult(origL, newL) {
    let checker = true;
    for (let i = 0; i < origL.length; i++) {
      if (origL[i] != newL[i]) {
        checker = false
      }
    }
    return checker;
  };

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
    const dataMarks = dataGroup.selectAll('circle')
      .data(dataPoints);

    let updatePoint = function(points) {
      points
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 5)
        .attr('fill', d => d.group ? d.group.color : 'black');
    }
    updatePoint(dataMarks.enter().append('circle'));
    updatePoint(dataMarks.transition().duration(1000));
    dataMarks.exit().remove();

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
      .attr('d', symbol().type(symbolCross))
      .attr('stroke', 'black'));
    drawCenter(c.transition().duration(1000));
  }

  function initData() {
    let n = parseInt(select('#n')._groups[0][0].value, 10);
    dataPoints = [];
    let i = 0;
    for (i; i < n; i++) {
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
    let k = parseInt(select('.k')._groups[0][0].value, 10);
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

  function exampleGen(input) {
    dataPoints = [];
    clusters = [];
    let i = 0;
    let j = 0;
    let k = examples[input].centroid.length
    for (i = 0; i < k; i++) {
      let n = examples[input].points[i].length
      for (j = 0; j < n; j++) {
        let point = {
          x: examples[input].points[i][j][0] * innerWidth,
          y: examples[input].points[i][j][1] * innerHeight,
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
          x: examples[input].centroid[i][0] * innerWidth,
          y: examples[input].centroid[i][1] * innerHeight
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

  function drawPremade() {
    const dataMarks = dataGroup.selectAll('circle')
      .data(dataPoints);

    let updatePoint = function(points) {
      points
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 5)
        .attr('fill', d => d.group ? d.group.color : 'black');
    }
    updatePoint(dataMarks.enter().append('circle'));
    updatePoint(dataMarks.transition().duration(1000));
    dataMarks.exit().remove();

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
      .attr('d', symbol().type(symbolCross))
      .attr('stroke', 'black'));
    drawCenter(c.transition().duration(1000));
  }

  select('#cent1').on('click', function() {updateCentroid(); draw(); });
  select('#clust1').on('click', function() {updateCluster(); draw(); });
  select('#new1').on('click', function() {wipeOut(); initData(); draw(); });
  select('#gen1').on('click', function() {initCentroid(); draw(); });
  select('#cent2').on('click', function() {updateCentroid(); draw(); });
  select('#clust2').on('click', function() {updateCluster(); draw(); });
  select('#restart1').on('click', function() {restart(); draw(); })
  select('#mickey').on('click', function() {exampleGen('mickey'); drawPremade(); })
  select('#spectral').on('click', function() {exampleGen('spectral'); drawPremade(); })
  select('#overunder').on('click', function() {exampleGen('overunder'); drawPremade(); })
  select('#overunder2').on('click', function() {exampleGen('overunder2'); drawPremade(); })
  select('#adequate').on('click', function() {exampleGen('adequate'); drawPremade(); })
  select('#adequate2').on('click', function() {exampleGen('adequate2'); drawPremade(); })
  select('#cent3').on('click', function() {updateCentroid(); draw(); });
  select('#clust3').on('click', function() {updateCluster(); draw(); });
  select('#cent4').on('click', function() {updateCentroid(); draw(); });
  select('#clust4').on('click', function() {updateCluster(); draw(); });
  select('#cent5').on('click', function() {updateCentroid(); draw(); });
  select('#clust5').on('click', function() {updateCluster(); draw(); });
  select('#cent6').on('click', function() {updateCentroid(); draw(); });
  select('#clust6').on('click', function() {updateCluster(); draw(); });
  select('#gen2').on('click', function() {initCentroid(); draw(); });
  initData(); draw();

}

/* 버튼 조정하는 법
select("#centroid")
  .style('padding', '.5em .8em')
  .style('background-color', 'blue')
  .style('color', 'white')
  .style('font-size', '16px')
*/
