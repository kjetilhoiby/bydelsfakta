/**
 * Template for multi series multi-line chart.
 *
 * A details box appears when rendered with highlight parameter
 * defined in the options object.
 *
 * Change tabs by rendering with the series parameter defined
 * in the options object.
 */

import Base_Template from './baseTemplate';
import util from './template-utils';
import {color} from './colors';
import d3 from '@/assets/d3';
import positionLabels from '../positionLabels';

function Template(svg) {
  Base_Template.apply(this, arguments);

  this.padding = { top: 130, left: 60, right: 190, bottom: 32 };

  // Line generator
  let line = d3
    .line()
    .x(d => this.x(this.parseYear(d.date)))
    .y(d => this.y(d[this.method]));

  this.render = function(data, options = {}) {
    if (!this.commonRender(data, options)) return;

    this.width = d3.max([this.width, 300]);

    this.data.data = this.data.data.sort((a, b) => {
      return (
        b.values[this.series][b.values[this.series].length - 1].value -
        a.values[this.series][a.values[this.series].length - 1].value
      );
    });

    this.heading.attr('y', 90).text(this.data.meta.heading[this.series]);
    this.height = 400;
    this.svg
      .transition()
      .duration(this.duration)
      .attr('height', this.padding.top + this.height + this.padding.bottom + this.sourceHeight)
      .attr('width', this.padding.left + this.width + this.padding.right);

    this.setScales();
    this.drawAxis();
    this.drawLines();
    this.drawTabs();
    this.drawLabels();
    this.drawDots();
    this.drawVoronoi();
    this.drawSource(
      'Statistisk sentralbyrå (test)',
      this.padding.top + this.height + this.padding.bottom + this.sourceHeight
    );
    this.drawTable();
  };

  // Creates elements for this template. Runs from base template along with init()
  this.created = function() {
    // Create tabs placeholder
    this.tabs = this.svg
      .insert('g')
      .attr('class', 'tabs')
      .attr('transform', 'translate(3, 23)');

    // stroke below tabs
    this.tabs.append('rect').attr('class', 'rule');

    this.canvas.append('g').attr('class', 'lines');
    this.canvas.append('g').attr('class', 'dots');
    this.canvas.append('g').attr('class', 'voronoi');
    this.canvas.append('g').attr('class', 'labels');

    // Call method for creating info box elements
    this.createInfoBoxElements();
  };

  // Line generator for converting values to a data string for svg:paths
  this.line = d3
    .line()
    .x(d => this.x(this.parseYear(d.date)))
    .y(d => this.y(d[this.method]))

  this.drawTable = function() {
    let thead = this.table.select('thead');
    let tbody = this.table.select('tbody');
    this.table.select('caption').text('Data');

    thead.selectAll('*').remove();
    tbody.selectAll('*').remove();

    let hRow1 = thead.append('tr');
    let hRow2 = thead.append('tr');

    let dates = new Set();
    this.data.data.forEach(row => {
      row.values[0].forEach(d => {
        dates.add(d.date);
      });
    });
    dates = [...dates];

    hRow1
      .selectAll('th')
      .data(() => [
        'Geografi',
        ...this.data.meta.series.map(serie => {
          return `${serie.heading} ${serie.subheading}`;
        }),
      ])
      .join('th')
      .attr('rowspan', (d, i) => (i === 0 ? 2 : 1))
      .attr('colspan', (d, i) => (i > 0 ? dates.length : 1))
      .attr('scope', 'col')
      .attr('id', (d, i) => `th_1_${i}`)
      .text(d => d);

    hRow2
      .selectAll('th')
      .data(() => {
        let out = [];
        for (var i = 0; i < this.data.meta.series.length; i++) {
          out = out.concat(dates);
        }
        return out;
      })
      .join('th')
      .attr('id', (d, i) => `th_2_${i}`)
      .text(d => this.formatYear(this.parseYear(d)));

    let rows = tbody
      .selectAll('tr')
      .data(this.data.data)
      .join('tr');

    // Geography cells
    rows
      .selectAll('th')
      .data(d => [d.geography])
      .join('th')
      .attr('scope', 'row')
      .attr('headers', 'th_1_0')
      .text(d => d);

    // Value cells
    rows
      .selectAll('td')
      .data(d => d.values.map(row => row).flat())
      .join('td')
      .attr('headers', (d, i, j) => {
        let first = Math.floor(i / (j.length / this.data.meta.series.length)) + 1;

        return `th_1_${first} th_2_${i}`;
      })
      .text(d => this.format(d[this.method], this.method));
  };

  this.drawDots = function() {
    let dotgroup = this.canvas
      .select('g.dots')
      .selectAll('g.dotgroup')
      .data(this.data.data, d => d.geography)
      .join('g')
      .attr('class', 'dotgroup');

    let dot = dotgroup
      .selectAll('g.dot')
      .data(d => d.values[this.series], d => d.geography)
      .join('g')
      .attr('class', 'dot')
      .attr('opacity', 0);

    dot
      .append('text')
      .text(d => d.value)
      .attr('x', d => this.x(this.parseYear(d.date)))
      .attr('y', d => this.y(d.value))
      .attr('font-size', 11)
      .attr('transform', `translate(0, -7)`)
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none');

    dot
      .append('circle')
      .attr('r', 4)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('cx', d => this.x(this.parseYear(d.date)))
      .attr('cy', d => this.y(d.value));
  };

  this.drawVoronoi = function() {
    let flattenData = this.data.data
      .map(geo => geo.values[this.series].map(val => ({ date: val.date, value: val.value, geography: geo.geography })))
      .flat();

    let voronoiData = d3
      .voronoi()
      .extent([[1, 1], [this.width, this.height]])
      .x(d => this.x(this.parseYear(d.date)))
      .y(d => this.y(d.value))
      .polygons(flattenData)
      .filter(Boolean)

    let voronoiCells = this.canvas
      .select('g.voronoi')
      .selectAll('path')
      .data(voronoiData)
      .join('path')
      .attr('d', d => 'M' + d.join('L') + 'Z')
      .attr('fill-opacity', 0);

    // Highlight a geography when hovering the chart. If the
    // chart is rendered with a geography highlighted, then only
    // the selected geography will be affected by hover.
    voronoiCells.on('mouseover', (d, i, j) => {
      let geography = j[i].__data__.data.geography;
      let date = j[i].__data__.data.date;

      if (this.highlight === -1 || this.data.data.findIndex(d => d.geography === geography) === this.highlight) {
        this.canvas.selectAll('g.dot').attr('opacity', 0);
        this.canvas
          .selectAll('g.dotgroup')
          .filter(dot => {
            if (dot.geography === geography) {
              this.handleMouseover(dot.geography);
              return true;
            }
          })
          .selectAll('g.dot')
          .filter(dot => dot.date === date)
          .attr('opacity', 1);
      }
    })
    
    // Remove highlight on mouse leave
    voronoiCells.on('mouseleave', () => {
      if (this.highlight === -1) {
        this.canvas.selectAll('g.dot').attr('opacity', 0);
        this.handleMouseleave();
      }
    });


    // When clicking a voronoi cell, the graph should re-render
    // with the selected geography highlighted. If the geography
    // is alredady selected, then we re-render with no highlight.
    voronoiCells.on('click', (d, i, j) => {
      let geography = j[i].__data__.data.geography;

      if (this.highlight >= 0 && this.data.data.findIndex(d => d.geography === geography) === this.highlight) {
        this.render(this.data, { method: this.method, series: this.series, highlight: -1 });
      } else {
        this.render(this.data, {
          method: this.method,
          series: this.series,
          highlight: this.data.data.findIndex(d => d.geography === geography),
        });
      }
    });
  };

  // Creates info box elements called from created()
  this.createInfoBoxElements = function() {
    // Create infobox placeholder
    this.infobox = this.svg.append('g').attr('class', 'infobox');
    this.infoboxBody = this.infobox.append('g').attr('class', 'infobox__body');
    this.infoboxBody.append('rect').attr('class', 'background');
    this.infoboxHead = this.infobox.append('g').attr('class', 'infobox__head');
    this.infoboxHead.append('rect').attr('class', 'background');
    this.infoboxTitle = this.infoboxHead.append('text');
    this.infoboxContent = this.infoboxBody.append('g').attr('class', 'infobox__content');
    this.infoboxHeading = this.infoboxContent.append('text').attr('class', 'infobox__heading');
    this.infoboxContent.append('rect').attr('class', 'infobox__rule');
    this.infoboxTable = this.infoboxContent.append('g').attr('class', 'infobox__table');
  };


  // Updates the tabs. Highlights the active series
  this.drawTabs = function() {
    this.tabs
      .select('rect.rule')
      .attr('height', 1)
      .attr('width', this.width + this.padding.left + this.padding.right)
      .attr('fill', color.purple)
      .attr('opacity', 0.2)
      .attr('y', 40);

    let tab = this.tabs.selectAll('g.tab').data(this.data.meta.series);
    let tabE = tab
      .enter()
      .append('g')
      .attr('class', 'tab');

    tabE
      .append('rect')
      .attr('class', 'bar')
      .attr('height', 4)
      .attr('width', this.tabWidth)
      .attr('y', 37)
      .attr('fill', color.blue);

    tabE
      .append('text')
      .attr('class', 'heading')
      .attr('font-size', 16)
      .attr('y', 5);
    tabE
      .append('text')
      .attr('class', 'subHeading')
      .attr('font-size', 12)
      .attr('y', 20);

    tabE
      .append('rect')
      .attr('class', 'tabOverlay')
      .attr('width', this.tabWidth)
      .attr('height', 60)
      .attr('opacity', 0)
      .attr('y', -20);

    tab.exit().remove();
    tab = tab.merge(tabE);

    tab.attr('transform', (d, i) => `translate(${i * (this.tabWidth + this.tabGap)}, 0)`);

    tab
      .select('text.heading')
      .attr('font-weight', (d, i) => (this.series === i ? '500' : '400'))
      .text(d => d.heading);
    tab
      .select('text.subHeading')
      .attr('font-weight', (d, i) => (this.series === i ? '500' : '400'))
      .text(d => d.subheading);

    tab
      .select('rect.tabOverlay')
      .on('click keyup', (d, i) => {
        if (d3.event && d3.event.type === 'keyup' && d3.event.key !== 'Enter') return;
        this.render(this.data, { method: this.method, series: i });
      })
      .attr('tabindex', 0);

    tab.select('rect.bar').attr('opacity', (d, i) => (this.series === i ? 1 : 0));
  };

  this.handleMouseover = function(geo) {
    this.canvas
      .select('g.labels')
      .selectAll('g.label')
      .attr('opacity', 0.5);

    this.canvas
      .select('g.labels')
      .selectAll('g.label')
      .select('text')
      .attr('font-weight', 400);

    this.canvas
      .select('g.labels')
      .selectAll('g.label')
      .filter(d => d.geography === geo)
      .attr('opacity', 1)
      .select('text')
      .attr('font-weight', 700);

    this.canvas
      .select('g.lines')
      .selectAll('path.row')
      .attr('stroke-opacity', 0.05)
      .attr('stroke-width', 2)
      .filter(d => d.geography === geo)
      .attr('stroke-opacity', 1)
      .attr('stroke-width', 4);
  };

  this.handleMouseleave = function() {
    this.canvas
      .select('g.labels')
      .selectAll('g.label')
      .attr('opacity', d => {
        if (d.avgRow || d.totalRow) return 1;
        return 0.45;
      });

    this.canvas
      .select('g.labels')
      .selectAll('g.label')
      .select('text')
      .attr('font-weight', d => {
        if (d.avgRow || d.totalRow) return 700;
        return 400;
      });

    this.canvas
      .select('g.lines')
      .selectAll('path.row')
      .attr('stroke-width', d => {
        if (d.avgRow) return 5;
        return 2;
      })
      .attr('stroke-opacity', d => {
        if (d.totalRow || d.avgRow) return 1;
        return 0.1;
      });
  };

  // Updates the labels
  this.drawLabels = function() {
    // Get y-position for each label calculated using
    // simple collision detection algorithm. Passing in
    // the original y-position and the available height in pixels
    let labelPositions = positionLabels(
      this.data.data.map(row => {
        row.y = this.y(row.values[this.series][row.values[this.series].length - 1].value);
        return row;
      }),
      this.height
    );

    let labels = this.canvas
      .select('g.labels')
      .selectAll('g.label')
      .data(labelPositions, d => d.geography)
      .join(enter => {
        let g = enter
          .append('g')
          .attr('class', 'label')
          .style('cursor', 'pointer');
        g.append('text').attr('x', this.width + 35);
        g.append('line')
          .attr('stroke-width', 9)
          .attr('x1', this.width + 22)
          .attr('x2', this.width + 31);
        g.append('title');
      })
      .attr('class', 'label')
      .style('cursor', 'pointer')
      .attr('tabindex', 0);

    // Click label to render with highlight
    labels.on('click keyup', (d, i, j) => {
      if (d3.event && d3.event.type === 'click') j[i].blur();
      if (d3.event && d3.event.type === 'keyup' && d3.event.key !== 'Enter') return;
      if (i === this.highlight) {
        this.render(this.data, { series: this.series, method: this.method, highlight: -1 });
      } else {
        this.render(this.data, { series: this.series, method: this.method, highlight: i });
      }
    });

    // Hover label to highlight itself and its corresponding line
    labels.on('mouseover', d => {
      if (this.highlight === -1) {
        this.handleMouseover(d.geography);
      }
    });

    //
    labels.on('mouseleave', () => {
      if (this.highlight === -1) {
        this.handleMouseleave();
      }
    });

    // Style the color swatch for each label
    labels
      .select('line')
      .transition()
      .duration(this.duration)
      .attr('x1', this.width + 22)
      .attr('x2', this.width + 31)
      .attr('stroke', (d, i, j) => {
        if (d.totalRow) return 'black';
        if (d.avgRow) return color.purple;
        return d3.interpolateRainbow(i / j.length);
      })
      .style('stroke-dasharray', d => {
        if (d.totalRow) return '2,1';
      });

    // Style the text label element
    labels
      .select('text')
      .transition()
      .duration(this.duration)
      .text(d => util.truncate(d.geography, this.padding.right - 40))
      .attr('x', this.width + 35)
      .attr('y', 5)
      .attr('font-weight', (d, i) => {
        if (this.highlight >= 0) {
          return this.highlight === i ? 700 : 400;
        }

        if (d.avgRow || d.totalRow) return 700;
        return 400;
      });

    // Style each label group (text and color swatch)
    labels
      .transition()
      .duration(this.duration)
      .attr('transform', (d, i) => `translate(0, ${labelPositions[i].start})`)
      .attr('opacity', (d, i) => {
        if (this.highlight >= 0) {
          return this.highlight === i ? 1 : 0.1;
        }
        if (d.avgRow || d.totalRow) return 1;
        return 0.45;
      });



    // Update content in the <title> element
    labels.select('title').html(d => d.geography);
  };

  // Updates the shape and style of the lines in the line chart
  this.drawLines = function() {
    // Each line is a path element
    this.canvas
      .select('g.lines')
      .selectAll('path.row')
      .data(this.data.data, d => d.geography)
      .join(enter => {
        return enter.append('path').attr('d', d => {
          let initialData = d.values[this.series].map(val => {
            return {
              date: val.date,
              value: 0,
            };
          });
          return this.line(initialData);
        });
      })
      .attr('class', 'row')
      .style('pointer-events', 'none')
      .attr('fill', 'none')
      .transition()
      .duration(100)
      .delay((d, i) => i * 30)
      .attr('d', d => this.line(d.values[this.series]))
      .attr('stroke', (d, i, j) => {
        if (d.totalRow) return 'black';
        if (d.avgRow) return color.yellow;
        return d3.interpolateRainbow(i / j.length);
      })
      .attr('stroke-width', (d, i) => {
        if (this.highlight === i) return 5;
        if (d.avgRow) return 5;
        return 2;
      })
      .attr('stroke-opacity', (d, i) => {
        if (this.highlight >= 0 && this.highlight !== i) return 0.1;
        if (this.highlight >= 0 && this.highlight === i) return 1;
        if (d.totalRow || d.avgRow) return 1;
        return 0.2;
      })
      .style('stroke-dasharray', d => {
        if (d.totalRow) return '4,3';
      });
  };


  this.setScales = function() {
    this.y.max = d3.max(this.data.data.map(row => d3.max(row.values[this.series].map(d => d[this.method])))) * 1.05;
    this.y.min = d3.min(this.data.data.map(row => d3.min(row.values[this.series].map(d => d[this.method])))) / 1.05;

    this.x = d3
      .scaleTime()
      .domain([
        d3.timeMonth.offset(this.parseYear(this.data.data[0].values[0][0].date), -2),
        d3.timeMonth.offset(
          this.parseYear(this.data.data[0].values[this.series][this.data.data[0].values[this.series].length - 1].date),
          0
        ),
      ])
      .range([0, this.width])
      .nice();

    this.y = d3
      .scaleLinear()
      .domain([this.y.min, this.y.max])
      .range([this.height, 0])
      .nice();
  };

  this.drawAxis = function() {
    this.yAxis
      .transition()
      .duration(this.duration)
      .call(
        d3
          .axisLeft(this.y)
          .ticks(this.height / 30)
          .tickFormat(d => this.format(d, this.method, true))
      );
    this.xAxis
      .attr('transform', `translate(0, ${this.height})`)
      .transition()
      .duration(this.duration)
      .call(d3.axisBottom(this.x).ticks(d3.timeYear));
  };

  this.init(svg);
}

export default Template;
