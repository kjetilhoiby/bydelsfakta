/**
 * Template for bar chart which supports both single or multiple series.
 */

import Base_Template from './baseTemplate';
import util from './template-utils';
import color from './colors';
import d3 from '@/assets/d3';

function Template(svg) {
  Base_Template.apply(this, arguments);

  this.padding = { top: 100, left: 190, right: 20, bottom: 30 };
  this.gutter = 30;
  this.x2 = d3.scaleLinear();
  this.x = [];
  this.filteredData;
  this.mobileWidth = 400;

  const formatPercent = d3.format('.0%');

  this.render = function(data, options = {}) {
    this.selected = options.selected !== undefined ? options.selected : -1;

    // Multiseries need larger padding top to make room for tabs
    this.padding.top = data.meta.series.length <= 1 && this.selected === -1 ? 40 : 100;

    if (!this.commonRender(data, options)) return;

    if (this.parentWidth() < this.mobileWidth) {
      this.padding.left = 10;
    } else {
      this.padding.left = 190;
    }

    // Make a filtered copy of the provided data object containing
    // to house only the selected series (if one has been selected)
    this.filteredData = JSON.parse(JSON.stringify(this.data));
    if (this.selected > -1) {
      this.filteredData.meta.series = [this.data.meta.series[this.selected]];
      this.filteredData.data = this.filteredData.data.map(bydel => {
        bydel.values = [bydel.values[this.selected]];
        return bydel;
      });
    }

    // Sort by highest value in first series
    this.filteredData.data = this.filteredData.data
      .sort((a, b) => b.values[0][this.method] - a.values[0][this.method])
      .sort((a, b) => (b.avgRow ? -1 : 0))
      .sort((a, b) => (b.totalRow ? -1 : 0));

    this.svg
      .transition()
      .attr('height', this.padding.top + this.height + this.padding.bottom + this.sourceHeight)
      .attr('width', this.padding.left + this.width + this.padding.right);

    // Move the close button
    this.canvas
      .select('g.close')
      .style('display', () => {
        return this.selected > -1 ? 'block' : 'none';
      })
      .attr('transform', `translate(${this.width - 30}, -60)`)
      .attr('tabindex', this.selected === -1 ? false : 0);

    this.setScales();
    this.drawColumns();
    this.drawRows();
    this.drawAxis();
    this.drawSource('Statistisk sentralbyrå (test)');
  };

  this.created = function() {
    this.canvas.append('g').attr('class', 'columns');
    this.canvas.append('g').attr('class', 'rows');

    // Create and initialise the close button
    let close = this.canvas
      .append('g')
      .attr('class', 'close')
      .style('display', 'none')
      .on('click keyup', () => {
        if (d3.event && d3.event.type === 'keyup' && d3.event.key !== 'Enter') return;
        this.render(this.data, { method: this.method });
      });

    // Close button background
    close
      .append('rect')
      .attr('width', 30)
      .attr('height', 30)
      .attr('fill', color.red)
      .style('cursor', 'pointer')
      .attr('opacity', 0.7)
      .on('mouseenter', function() {
        d3.select(this)
          .transition()
          .duration(this.duration)
          .attr('opacity', 1);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(this.duration)
          .attr('opacity', 0.7);
      });

    // Close button icon
    close
      .append('text')
      .attr('fill', color.purple)
      .style('pointer-events', 'none')
      .text('x')
      .attr('font-weight', 700)
      .attr('font-size', 20)
      .attr('text-anchor', 'middle')
      .attr('transform', 'translate(15, 20)');
  };

  /**
   * @param  {nodelist} rowsE - The newly created rows
   *
   * Creates all the DOM elements inside of each row
   */
  this.initRowElements = function(el) {
    let g = el.append('g').attr('class', 'row');

    // Row fill
    g.insert('rect')
      .attr('class', 'rowFill')
      .attr('fill', color.purple)
      .attr('height', this.rowHeight)
      .attr('x', -this.padding.left)
      .attr('width', this.width + this.padding.left);

    // Row divider
    g.insert('rect')
      .attr('class', 'divider')
      .attr('fill', color.purple)
      .attr('x', -this.padding.left)
      .attr('width', this.width + this.padding.left)
      .attr('height', 1)
      .attr('y', this.rowHeight);

    // Row Geography
    let hyperlink = g.append('a').attr('class', 'hyperlink');

    // Text element inside of hyperlink
    hyperlink
      .append('text')
      .attr('class', 'geography')
      .attr('fill', color.purple)
      .attr('y', this.rowHeight / 2 + 6);

    g.append('g').attr('class', 'bars');

    return g;
  };

  /**
   * Updates elements on each row
   */
  this.drawRows = function() {
    // Select all existing rows (DOM elements) that matches the data
    let rows = this.canvas
      .select('g.rows')
      .selectAll('g.row')
      .data(this.filteredData.data, d => d.geography)
      .join(
        enter => {
          let el = this.initRowElements(enter);
          el.attr('transform', (d, i) => `translate(0, ${i * this.rowHeight})`);
          return el;
        },
        update => update.transition().attr('transform', (d, i) => `translate(0, ${i * this.rowHeight})`)
      )
      .attr('class', 'row');

    // Dynamic styling, sizing and positioning based on data and container size
    rows
      .select('rect.rowFill')
      .attr('fill-opacity', d => (d.avgRow || d.totalRow ? 0 : 0))
      .attr('width', this.padding.left + this.width + this.padding.right);
    rows
      .select('rect.divider')
      .attr('fill-opacity', d => {
        if (this.data.meta.series.length === 1) return 0;
        if (this.parentWidth() < this.mobileWidth) {
          return 0;
        } else {
          return d.avgRow || d.totalRow ? 0.5 : 0.2;
        }
      })
      .attr('width', this.padding.left + this.width + this.padding.right);

    rows.select('a.hyperlink').attr('xlink:href', `/bydelsfakta#/bydel/sthanshaugen/folkemengde`);
    rows
      .select('a.hyperlink')
      .select('text')
      .text(d => d.geography)
      .attr('x', () => {
        if (this.parentWidth() < this.mobileWidth) return 0;
        return this.data.meta.series.length > 1 ? -this.padding.left + 10 : -10;
      })
      .attr('y', () => {
        if (this.parentWidth() < this.mobileWidth) {
          return 20;
        } else {
          return this.rowHeight / 2 + 6;
        }
      })
      .attr('text-anchor', () => {
        if (this.parentWidth() < this.mobileWidth) return 'start';
        if (this.data.meta.series.length > 1) return 'start';
        return 'end';
      });

    rows.select('text.geography').attr('font-weight', d => (d.avgRow || d.totalRow ? 700 : 400));

    rows
      .select('text.geography')
      .append('title')
      .html(d => d.geography);

    // Add attributes to total and avg rows
    rows.attr('fill', d => {
      if (d.avgRow) return color.yellow;
      if (d.totalRow) return color.purple;
      return color.purple;
    });

    let bars = rows
      .selectAll('rect.bar')
      .data(d => d.values)
      .join('rect')
      .attr('class', 'bar');

    bars
      .attr('height', (d, i, j) => {
        if (this.parentWidth() < this.mobileWidth) return 4;
        return j[0].parentNode.__data__.totalRow ? 2 : this.barHeight;
      })
      .attr('y', (d, i, j) => {
        if (this.parentWidth() < this.mobileWidth) {
          return (this.rowHeight - this.barHeight) / 2 + 16;
        } else {
          return j[0].parentNode.__data__.totalRow ? this.rowHeight / 2 : (this.rowHeight - this.barHeight) / 2;
        }
      })
      .attr('opacity', (d, i) => {
        return i === this.highlight || this.highlight === -1 || this.highlight === undefined ? 1 : 0.2;
      })
      .transition()
      .duration(this.duration)
      .attr('width', (d, i) => {
        if (this.method === 'value' && d.value > this.x[i].domain()[1]) return 0;
        return this.x[0](d[this.method]);
      })
      .attr('x', (d, i) => this.x[i](0));

    bars
      .on('mousemove', d => {
        if (this.method === 'ratio') {
          this.showTooltip(formatPercent(d.ratio), d3.event);
        } else {
          this.showTooltip(Math.round(d[this.method]), d3.event);
        }
      })
      .on('mouseleave', () => {
        this.hideTooltip();
      });
  };

  this.setScales = function() {
    let maxValues = this.filteredData.meta.series.map((row, i) => {
      return d3.max(
        this.filteredData.data.filter(d => !(this.method === 'value' && d.totalRow)).map(d => d.values[i][this.method])
      );
    });

    this.x2 = d3
      .scaleLinear()
      .range([0, this.width - (this.gutter * this.filteredData.meta.series.length - 1)])
      .domain([0, d3.sum(maxValues)]);

    this.x = this.filteredData.meta.series.map((series, index) => {
      const SCALE = d3.scaleLinear();
      let startPos = 0;
      for (let j = 0; j < index; j++) {
        startPos += this.x2(maxValues[j]);
        startPos += this.gutter;
      }
      let endPos = startPos + this.x2(maxValues[index]);
      SCALE.domain([0, maxValues[index]]).range([startPos, endPos]);

      return SCALE;
    });

    this.x2.domain(this.filteredData.meta.series.map((d, i) => i)).range([0, this.width]);
  };

  this.drawAxis = function() {
    this.xAxis = this.canvas
      .selectAll('g.axis.x')
      .data(this.x)
      .join('g')
      .attr('class', 'axis x');

    this.xAxis.each((d, i, j) => {
      d3.select(j[i])
        .attr('opacity', () => {
          return i === this.highlight || this.highlight === -1 || this.highlight === undefined ? 1 : 0.2;
        })
        .transition()
        .duration(this.duration)
        .attr('transform', `translate(0, ${this.height + 10})`)
        .call(
          d3
            .axisBottom(this.x[i])
            .ticks((this.x[i].range()[1] - this.x[i].range()[0]) / 60)
            .tickFormat(d => (this.method === 'ratio' ? formatPercent(d) : d))
        );
    });
  };

  this.drawColumns = function() {
    let columns = this.canvas
      .select('g.columns')
      .selectAll('g.column')
      .data(this.filteredData.meta.series)
      .join(enter => {
        let g = enter.append('g').attr('class', 'column');
        g.append('rect').attr('fill', color.light_grey);
        g.append('rect')
          .attr('class', 'arrow')
          .attr('width', 1)
          .attr('height', 11);
        g.append('text')
          .attr('class', 'colHeading')
          .attr('transform', 'translate(0, -40)');
        g.append('text')
          .attr('class', 'colSubheading')
          .attr('transform', 'translate(0, -20)');
        return g;
      });

    columns
      .transition()
      .duration(this.duration)
      .attr('transform', (d, i) => `translate(${this.x[i](0)},0)`);

    columns
      .select('rect.clickTrigger')
      .style('cursor', () => {
        if (this.data.meta.series.length > 1) return 'pointer';
      })
      .attr('width', (d, i) => {
        return this.x[i].range()[1] - this.x[i].range()[0] + this.gutter;
      })
      .attr('height', this.height + 80)
      .attr('transform', `translate(0, -60)`)
      .attr('fill', 'black')
      .attr('opacity', 0)
      .on('mouseover', (d, i) => {
        this.render(this.data, { highlight: i, selected: this.selected, method: this.method });
      })
      .on('mouseleave', () => {
        this.render(this.data, { highlight: -1, selected: this.selected, method: this.method });
      })
      .on('click keyup', (d, i, j) => {
        if (d3.event && d3.event.type === 'keyup' && d3.event.key !== 'Enter') return;
        if (this.data.meta.series.length === 1) return;
        let target = this.selected > -1 ? -1 : i;

        // Move affected column to index 0 in DOM to ensure smooth transitions
        let columnToBeMoved = j[i].parentElement;
        columnToBeMoved.parentElement.prepend(columnToBeMoved);

        // Move affected rects to index 0 in DOM to ensure smooth transitions
        let barsToBeMoved = this.canvas
          .select('g.rows')
          .selectAll('g.row')
          .selectAll('rect.bar')
          .filter((dd, ii) => {
            return ii === i;
          });

        barsToBeMoved.each(function() {
          let barElement = d3.select(this).node();
          barElement.parentElement.prepend(barElement);
        });

        this.render(this.data, { selected: target, method: this.method });
      })
      .attr('tabindex', this.filteredData.meta.series.length > 1 ? 0 : false);

    columns
      .select('text.colHeading')
      .style('display', () => {
        return this.filteredData.meta.series.length > 1 || this.selected > -1 ? 'inherit' : 'none';
      })
      .text(d => d.heading)
      .append('title')
      .html(d => d.heading);

    columns
      .select('text.colSubheading')
      .text((d, i) => util.truncate(d.subheading, this.x[i].range()))
      .style('display', () => {
        return this.filteredData.meta.series.length > 1 || this.selected > -1 ? 'inherit' : 'none';
      })
      .append('title')
      .html(d => d.subheading);

    columns.select('text.colHeading').attr('opacity', (d, i) => {
      return i === this.highlight || this.highlight === -1 || this.highlight === undefined ? 1 : 0.2;
    });

    columns.select('text.colSubheading').attr('opacity', (d, i) => {
      return i === this.highlight || this.highlight === -1 || this.highlight === undefined ? 1 : 0.2;
    });

    columns
      .select('rect')
      .attr('y', -10)
      .transition()
      .duration(this.duration)
      .attr('height', this.height + 10)
      .duration(this.duration)
      .attr('width', (d, i) => {
        let val = this.filteredData.data.filter(d => d.totalRow)[0].values[i][this.method];
        if (this.method === 'value' && val > this.x[i].domain()[1]) return 0;
        if (this.filteredData.data.filter(d => d.totalRow).length) {
          return this.x[0](val);
        } else {
          return 0;
        }
      });

    columns
      .select('rect.arrow')

      .attr('transform', `translate(0, ${this.rowHeight / 2 - 5})`)
      .transition()
      .duration(this.duration)
      .attr('y', () => {
        let indexOfTotalRow = this.filteredData.data.findIndex(d => d.totalRow);
        return indexOfTotalRow * this.rowHeight;
      })
      .attr('x', (d, i) => {
        let val = this.filteredData.data.filter(d => d.totalRow)[0].values[i][this.method];
        if (this.method === 'value' && val > this.x[i].domain()[1]) return 0;
        return this.x[0](val);
      })
      .attr('opacity', (d, i) => {
        let val = this.filteredData.data.filter(d => d.totalRow)[0].values[i][this.method];
        if (this.method === 'value' && val > this.x[i].domain()[1]) {
          return 0;
        } else {
          return 1;
        }
      });
  };

  this.init(svg);
}

export default Template;
