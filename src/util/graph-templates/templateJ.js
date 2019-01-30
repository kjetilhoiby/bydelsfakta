/**
 * Template for stacked bar charts with positive and negative values
 * aligned at 0.
 */

import Base_Template from './baseTemplate';
import util from './template-utils';
import color from './colors';
import d3 from '@/assets/d3';

function Template(svg) {
  Base_Template.apply(this, arguments);

  this.padding = { top: 90, left: 240, right: 20, bottom: 58 };
  this.x = d3.scaleLinear();
  this.bars;
  this.legendBox;
  this.colors = d3
    .scaleOrdinal()
    .domain([0, 1, 2, 3])
    .range(['#C57066', '#834B44', '#838296', '#4F4E6A']);

  this.render = function(data) {
    if (!this.commonRender(data)) return;

    // Convert first two values into negative numbers
    // to support the concept of 'positive' and 'negative'
    // values in this chart.
    this.data.data = data.data.map(bydel => {
      bydel.values = bydel.values.map((value, i) => {
        if (value < 0) return value;
        return i < 2 ? value * -1 : value;
      });
      return bydel;
    });

    // Resize svg based on number of rows and container width
    this.svg
      .transition()
      .duration(this.duration)
      .attr('height', this.padding.top + this.height + this.padding.bottom + this.sourceHeight)
      .attr('width', this.width + this.padding.left + this.padding.right);

    this.drawRows();
    this.drawLegend();
    this.drawSource('Statistisk sentralbyrå (test)');

    // Move the 'zero line' to the x's zero position
    this.canvas
      .select('line.zero')
      .attr('y1', 0)
      .attr('y2', this.height)
      .transition()
      .duration(this.duration)
      .attr('x1', this.x(0))
      .attr('x2', this.x(0));

    // Move the x labels to either side of the x's 0 position
    this.canvas.select('text.label-min').attr('x', this.x(0) - 15);
    this.canvas.select('text.label-max').attr('x', this.x(0) + 15);
  };

  this.created = function() {
    // Create container for legend box
    this.legendBox = this.svg.append('g').attr('class', 'legend');

    // Add two labels above the xAxis
    this.canvas
      .append('text')
      .attr('class', 'label-min')
      .attr('font-size', 13)
      .attr('y', -40)
      .attr('text-anchor', 'end')
      .text('Trangbodde husstander');

    this.canvas
      .append('text')
      .attr('class', 'label-max')
      .attr('font-size', 13)
      .attr('y', -40)
      .attr('text-anchor', 'start')
      .text('Ikke trangbodde husstander');

    // Containers for rows and bars need to be in this order
    // to allow pointer events on bars
    this.canvas.append('g').attr('class', 'rows');
    this.bars = this.canvas.append('g').attr('class', 'bars');

    // Create the 'zero line' last to ensure it's always on top (thus visible)
    this.canvas
      .append('line')
      .attr('class', 'zero')
      .attr('stroke-width', 1.5)
      .attr('stroke', 'black');
  };

  // Creates and set default styles for the DOM elements on each row
  this.initRowElements = function(rowsE) {
    // Row fill
    rowsE
      .append('rect')
      .attr('class', 'rowFill')
      .attr('fill', color.purple)
      .attr('height', this.rowHeight)
      .attr('x', -this.padding.left)
      .attr('width', this.width + this.padding.left);

    // Row divider
    rowsE
      .append('rect')
      .attr('class', 'divider')
      .attr('fill', color.purple)
      .attr('x', -this.padding.left)
      .attr('width', this.width + this.padding.left)
      .attr('height', 1)
      .attr('y', this.rowHeight);

    // Row Geography
    rowsE
      .append('text')
      .attr('class', 'geography')
      .attr('fill', color.purple)
      .attr('y', this.rowHeight / 2 + 6)
      .attr('x', -this.padding.left + 10);
  };

  // Updates the rows
  this.drawRows = function() {
    // Standard select/enter/update/exit pattern
    let rows = this.canvas
      .select('g.rows')
      .selectAll('g.row')
      .data(this.data.data);
    let rowsE = rows
      .enter()
      .append('g')
      .attr('class', 'row');
    rows.exit().remove();
    rows = rows.merge(rowsE);

    // Create elements on each row that's created on enter
    this.initRowElements(rowsE);

    // Update row geography, style and position
    rows.select('text.geography').attr('font-weight', d => (d.avgRow || d.totalRow ? 700 : 400));

    // Update the row fill
    rows
      .select('rect.rowFill')
      .transition()
      .duration(this.duration)
      .attr('width', this.padding.left + this.width + this.padding.right)
      .attr('fill-opacity', d => (d.avgRow || d.totalRow ? 0.05 : 0));

    // Update the row divider
    rows
      .select('rect.divider')
      .transition()
      .duration(this.duration)
      .attr('width', this.padding.left + this.width + this.padding.right)
      .attr('fill-opacity', d => (d.avgRow || d.totalRow ? 0.5 : 0.2));

    // Vertically position the rows
    rows.attr('transform', (d, i) => `translate(0, ${i * this.rowHeight})`);

    // Update the row label (geography)
    rows.select('text.geography').text(d => util.truncate(d.geography, this.padding.left));

    // Create the stack data using the .offset method to create negative values
    // The order of keys in the .keys() method determines the order of the series
    // in the stack
    let seriesData = d3
      .stack()
      .keys([1, 0, 2, 3])
      .offset(d3.stackOffsetDiverging)(this.data.data.map(bydel => bydel.values));

    // Find the minimum and maximum values (and add a bit of padding) for the x scale
    let min = d3.min(seriesData.map(serie => d3.min(serie.map(d => d[0])))) * 1.1;
    let max = d3.max(seriesData.map(serie => d3.max(serie.map(d => d[1])))) * 1.1;

    // Set the x-scale's domain and range
    this.x.domain([min, max]).range([0, this.width]);

    // Update the xAxis using the x-scale
    // Calculate the number of ticks based on the width.
    this.xAxis.call(
      d3
        .axisTop(this.x)
        .ticks(this.width / 60)
        .tickFormat(d => Math.abs(d) * 100 + '%')
    );

    // Standard select/enter/update/exit pattern for the series
    // using the series data created using d3.stack()
    let series = this.bars.selectAll('g.series').data(seriesData);
    let seriesE = series
      .enter()
      .append('g')
      .attr('class', 'series');
    series.exit().remove();
    series = series.merge(seriesE);

    // Give each series a fill color
    series.attr('fill', (d, i) => this.colors(i));

    // Standard select/enter/update/exit pattern for
    // the bars in each series
    let bar = series.selectAll('rect').data(d => d);
    let barE = bar.enter().append('rect');
    bar.exit().remove();
    bar = bar.merge(barE);

    // Style and position each bar using the
    // values generated by d3.stack()
    bar
      .attr('y', (d, i) => i * this.rowHeight + (this.rowHeight - this.barHeight) / 2)
      .attr('height', this.barHeight)
      .transition()
      .duration(this.duration)
      .attr('x', d => this.x(d[0]))
      .attr('width', d => this.x(d[1]) - this.x(d[0]));

    // Add interaction to the bars
    bar
      .on('mouseenter', function() {
        bar
          .transition()
          .duration(this.duration)
          .delay(200)
          .attr('opacity', 0.3);
        d3.select(this)
          .transition()
          .duration(this.duration)
          .attr('opacity', 1);
      })
      .on('mousemove', (d, i, j) => {
        this.showTooltip(Math.round((d[1] - d[0]) * 100) + '%', d3.event);
      })
      .on('mouseleave', (d, i, j) => {
        bar
          .transition()
          .duration(this.duration)
          .attr('opacity', 1);
        this.hideTooltip();
      });
  };

  // Updates the legends on each render
  this.drawLegend = function() {
    // Re-position the legend box based on the height of the svg
    this.legendBox.attr('transform', `translate(0, ${this.height + this.padding.top + this.padding.bottom / 2 - 8})`);

    // Standard select/enter/update/exit pattern for each series
    let group = this.legendBox.selectAll('g.group').data(this.data.meta.series);
    let groupE = group
      .enter()
      .append('g')
      .attr('class', 'group');
    group.exit().remove();
    group = group.merge(groupE);

    // Create DOM elements for newly created legend groups (series)
    groupE
      .append('rect')
      .attr('height', 16)
      .attr('width', 16)
      .attr('rx', 3)
      // Cheap trick to ensure correct colors on the legend
      .attr('fill', (d, i) => {
        if (i === 0) {
          return this.colors(1);
        } else if (i === 1) {
          return this.colors(0);
        } else {
          return this.colors(i);
        }
      });
    groupE.append('text').attr('y', 8);

    // Update the label for each series in the legend
    group
      .select('text')
      .text(d => d.heading)
      .attr('y', 12)
      .attr('x', 20)
      .attr('font-size', 12);
    group.attr(
      'transform',
      (d, i) => `translate(${i * ((this.width + this.padding.left + this.padding.right) / 4)}, 0)`
    );
  };

  this.init(svg);
}

export default Template;