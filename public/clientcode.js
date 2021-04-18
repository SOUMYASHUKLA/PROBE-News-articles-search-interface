
// Get data from ES/Node js

var formatNumber = d3.format(",d"),
      formatChange = d3.format("+,d"),
      formatDate = d3.time.format("%B %d, %Y"),
      formatTime = d3.time.format("%I:%M %p");


/*
let alldata = [
  {title: "title1", category:"sports", source:"paper1", date:"2015-09-03T10:06:00Z",mediatype:"news", content:"abcd ajsfas", newslength:3},
  {title: "title2", category:"entertainment", source:"paper2", date:"2010-09-03T10:06:00Z", mediatype:"blog", content:"abcd xyz", newslength:7},
  {title: "title3", category:"others", source:"paper3", date:"2016-09-03T10:06:00Z", mediatype:"news", content:"abcd gho", newslength:12},
  {title: "title4", category:"others", source:"paper3", date:"2017-09-03T10:06:00Z", mediatype:"news", content:"abcd pqr", newslength:32},
  {title: "title1", category:"sports", source:"paper1", date:"2015-09-03T10:06:00Z",mediatype:"news", content:"abcd ajsfas", newslength:3},
  {title: "title1", category:"sports", source:"paper1", date:"2015-09-03T10:06:00Z",mediatype:"news", content:"abcd ajsfas", newslength:3},
  {title: "title3", category:"others", source:"paper3", date:"2016-09-03T10:06:00Z", mediatype:"blog", content:"abcd gho", newslength:12},
  {title: "title4", category:"others", source:"paper3", date:"2017-09-03T10:06:00Z", mediatype:"blog", content:"abcd pqr", newslength:32}
]
*/

let alldata = allRecords;

// Create the crossfilter for the relevant dimensions and groups.
  var articles = crossfilter(alldata),
      all = articles.groupAll(),
      date = articles.dimension(function(d) { return d.date; }),
      //dates = date.group(d3.time.day),
      //hour = articles.dimension(function(d) { return d.date.getHours() + d.date.getMinutes() / 60; }),
      //hours = hour.group(Math.floor),
      //year = articles.dimension(function(d) { return d.date.getYear() }),
      dimensionSource = articles.dimension(item => item.source),
      totalarticles_sourcewise = dimensionSource.group().reduceCount().all(),
      dimensionMedia = articles.dimension(item => item.mediatype),
      totalarticles_mediawise = dimensionMedia.group().reduceCount().all();
  

var dispatch = d3.dispatch('redraw');
drawBar('#sources-chart', dispatch, dimensionSource, totalarticles_sourcewise);
drawBar('#mediatype-chart', dispatch, dimensionMedia, totalarticles_mediawise);
dispatch.redraw();

d3.select(self.frameElement).style("height", "738px");

function drawBar (selector, dispatch, dimension, group) {

  var margin = {top: 0, right: 0, bottom: 40, left: 50},
    width = 475 - margin.left - margin.right,
    height = 480 - margin.top - margin.bottom;

  var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .ticks(10);

  var t = d3.transition()
        .duration(750);

  var svg = d3.select(selector),
        g = svg.select('g');

  function click(d) {
    dimension.filter(d ? d.key : null);
    dispatch.redraw();
    svg.selectAll('rect').classed('active', false)
    if(!d) {
      return reset.style('display', 'none');
    }

    svg.select('.' + btoa(d.key).replace(/=/g, '')).classed('active', true)
    reset.style('display', 'block')
  }

  if (g.empty()) {
    g = svg.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    g.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    g.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Interactions');

    var reset = g.append('text')
      .attr('class', 'reset')
      .attr('y', 10)
      .attr('x', -40)
      .style('display', 'none')
      .text('reset')
      .on('click', click)
  }

  dispatch.on('redraw.' + selector, function () {
    //x.domain(group.all().map(function(d) { return d.key; }));
    //y.domain([0, d3.max(group.all(), function(d) { return d.value; })]);

    x.domain(group.map(function(d) { return d.key; }));
    y.domain([0, d3.max(group, function(d) { return d.value; })]);

    g.select('.y.axis')
      .transition(t)
       .call(yAxis)

    var xAxisDom = g.select('.x.axis')
     .transition(t)
      .call(xAxis)

    var rects = g.selectAll('rect')
        .data(group);

    rects.enter().append('rect')
        .on('click', click)
        .attr('class', function (d) { return btoa(d.key).replace(/=/g, '') })

    rects
        .classed('bar', true)
        .classed('bar--negative', function (d) { return d.key == 'female'})
        .classed('bar--positive', function (d) { return d.key == 'male'})
      .transition(t)
        // .attr('class', function(d) { return 'bar bar--' + (d.key == 'female' ? 'negative' : 'positive'); })
        .attr('x', function(d) { return x(d.key); })
        .attr('width', x.rangeBand())
        .attr('y', function(d) { return y(d.value); })
        .attr('height', function(d) { return height - y(d.value); })

    var texts = g.selectAll('.label')
        .data(group)

    texts.enter().append('text').attr('class', 'label').on('click', click)

    texts
      .transition(t)
        .attr('text-anchor', 'middle')
        .attr('x', function(d,i) {
            return x(d.key) + (x.rangeBand() / 2);
        })
        .attr('y', function(d,i) {
            return y(d.value) + ((height - y(d.value)) / 2);
        })
        .attr('dy', '.35em')
        .text(function (d) { return d.value })

  })
}//bar chart

