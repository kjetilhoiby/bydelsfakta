/**
 * Each graph template inherits properties and methods from this Base Template.
 * Once a template object is created the init() is called which clears the
 * provided SVG node and creates new DOM elements (mainly empty 'g's) inside of it.
 * At the end of init() the created() method is called. The template in question
 * may have needs of its own to create DOM elements inside the SVG at creation for
 * its own convenience, which would be inserted into this method if needed.
 *
 * Each template defines its own render() method which is called each time
 * new data is passed down from Vue, on resize (see below) or the template
 * itself requests a new render (typically on user interaction)
 *
 * Each template shares a lot of code to be run on each render() and thus the
 * commonRender() method exists in this Base Template.
 *
 * Vue listens for changes in size for the SVG's container. The resize()
 * method uses debounce to prevent the render() method to be 'smashed'.
 *
 * Number and time formats are defined in the locale.js file imported here
 * and is used by d3 globally.
 *
 */

import d3 from '@/assets/d3';
import debounce from '../debounce';
import color from './colors';
import * as locale from './locale';

d3.timeFormatDefaultLocale(locale.timeFormat);
d3.formatDefaultLocale(locale.format);

function Base_Template(svg) {
  // Declaring local variables here to prevent templates to be
  // unnecessary cluttered with commonly used variables.
  this.data = {};
  this.height = 0;
  this.width = 0;
  this.padding = { top: 30, right: 40, bottom: 40, left: 120 };
  this.height2 = 0;
  this.yGutter = 0;
  this.x = d3.scaleLinear();
  this.y = d3.scaleBand();
  this.max = 0;
  this.min = 0;
  this.rowHeight = 43;
  this.barHeight = 24;
  this.tabWidth = 120;
  this.tabGap = 10;
  this.strokeWidth = 4;
  this.strokeWidthHighlight = 6;
  this.parseDate = d3.timeParse('%Y-%m-%d');
  this.formatYear = d3.timeFormat('%Y');
  this.sourceHeight = 25;
  this.duration = 100;

  // Resize is called from the parent vue component
  // every time the container size changes.
  this.resize = debounce(function() {
    this.render(this.data, { method: this.method, series: this.series, highlight: this.highlight, event: 'resize' });
  }, 250);

  // Common operations to be run once a template is initialized
  this.init = function() {
    this.svg = d3.select(svg).style('font-family', 'OsloSans');

    this.svg.attr('xmlns:xlink', 'http://www.w3.org/1999/xlink').attr('xmlns', 'http://www.w3.org/2000/svg');

    // Clear the contents of the svg
    this.svg.selectAll('*').remove();

    // Append heading element
    this.heading = this.svg
      .append('text')
      .attr('class', 'heading')
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .attr('y', 14);

    // Append canvas element
    this.canvas = this.svg
      .append('g')
      .attr('class', 'canvas')
      .attr('transform', `translate(${this.padding.left}, ${this.padding.top})`);

    // Append common axis elements
    this.xAxis = this.canvas.append('g').attr('class', 'axis x');
    this.yAxis = this.canvas.append('g').attr('class', 'axis y');
    this.x2Axis = this.canvas.append('g').attr('class', 'axis x2');
    this.y2Axis = this.canvas.append('g').attr('class', 'axis y2');

    // The various templates have different needs for elements to be
    // appended to the svg after initialization. This method is run
    // once for each initialization.
    this.created();
    this.addSourceElement();
    this.addTooltipElement();
  };

  this.addTooltipElement = function() {
    let group = this.svg
      .append('g')
      .attr('class', 'tooltip')
      .attr('opacity', 0)
      .style('pointer-events', 'none');

    group
      .append('rect')
      .attr('transform', 'translate(0, -29)')
      .attr('fill', color.yellow)
      .attr('stroke', 'white')
      .attr('rx', 11)
      .attr('height', 21);
    group
      .append('text')
      .attr('transform', 'translate(0, -14)')
      .attr('font-size', 12)
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .attr('fill', color.purple);
  };

  this.showTooltip = function(str, event) {
    let group = this.svg.select('g.tooltip');
    let rect = group.select('rect');
    let text = group.select('text');

    group.attr('transform', `translate(${event.layerX}, ${event.layerY})`);
    text.text(str);
    rect.attr('width', text.node().getBBox().width + 20).attr('x', -(text.node().getBBox().width / 2 + 10));

    group.attr('opacity', 1);
  };

  this.hideTooltip = function(str) {
    let group = this.svg.select('g.tooltip');
    let rect = group.select('rect');
    let text = group.select('text');

    text.text('');

    group.attr('opacity', 0);
  };

  this.addSourceElement = function() {
    let group = this.svg
      .append('g')
      .attr('class', 'sourceGroup')
      .attr('fill', color.purple)
      .attr('opacity', 0);

    group
      .append('text')
      .attr('class', 'source-label')
      .attr('font-size', 10)
      .text('Kilde: ');

    group
      .append('text')
      .attr('class', 'source')
      .attr('font-size', 10)
      .attr('transform', () => {
        let labelWidth = group
          .select('.source-label')
          .node()
          .getBBox().width;
        return `translate(${labelWidth + 4}, 0)`;
      });
  };

  this.drawSource = function(str) {
    this.svg.select('text.source').text(str);
    let parent = this.svg.node().parentNode.getBoundingClientRect();
    let source = this.svg
      .select('g.sourceGroup')
      .node()
      .getBBox();
    let offsetX = parent.width - source.width;
    this.svg
      .select('g.sourceGroup')
      .attr('opacity', 1)
      .attr('transform', `translate(${offsetX}, ${parent.height - 9})`);
  };

  // The parent container width is needed for each render of a template.
  this.parentWidth = function() {
    return svg.parentNode.getBoundingClientRect().width;
  };

  // Placeholder for operations to be run once a child template is initialized
  this.created = function() {};

  // All templates share these common operations when rendered
  this.commonRender = function(data, options = {}) {
    if (data === undefined || data.data === undefined) return;

    data.data = Array.isArray(data.data) ? data.data.sort((a, b) => a.totalRow - b.totalRow) : data.data;
    this.data = data;

    this.heading.text(this.data.meta.heading);
    this.canvas.attr('transform', `translate(${this.padding.left}, ${this.padding.top})`);

    this.method = options.method || 'value';
    this.highlight = options.highlight === undefined || options.highlight == null ? -1 : options.highlight;
    this.series = options.series || 0;
    this.selected = options.selected === undefined || options.selected === null ? -1 : options.selected;

    this.width = this.parentWidth() - this.padding.left - this.padding.right;
    this.height = Array.isArray(this.data.data) ? this.data.data.length * this.rowHeight : 500;

    return true;
  };

  // Placeholder for the render method
  this.render = function() {};
}

export default Base_Template;
