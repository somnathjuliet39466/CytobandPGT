var gieStainColor = {
  gpos100: 'rgb(0,0,0)',
  gpos: 'rgb(0,0,0)',
  gpos75: 'rgb(130,130,130)',
  gpos66: 'rgb(160,160,160)',
  gpos50: 'rgb(200,200,200)',
  gpos33: 'rgb(210,210,210)',
  gpos25: 'rgb(200,200,200)',
  gvar: 'rgb(220,220,220)',
  gneg: 'rgb(255,255,255)',
  acen: 'rgb(217,47,39)',
  stalk: 'rgb(100,127,164)',
  select: 'rgb(135,177,255)',
};

var drawCircos = function (error, GRCh37, cytobands, data) {
  if (error) {
    console.error('Error loading data:', error);
    return;
  }

  var width = document.getElementById('chordsChart').offsetWidth || 800;

  // Define consistent radii with increased cytoband width
  var innerRadius = width / 2 - 200; // Reduced further for wider cytobands
  var outerRadius = width / 2 - 110;  // Outer radius remains the same

  var circos = new Circos({
    container: '#chordsChart',
    width: width,
    height: width,
  });

  // Process cytobands
  cytobands = cytobands.map(function (d) {
    return {
      block_id: d.chrom,
      start: parseInt(d.chromStart),
      end: parseInt(d.chromEnd),
      gieStain: d.gieStain,
      name: d.name,
    };
  });

  // Preprocess data to handle bidirectionality
  data = data.map(function (d) {
    // Check and enforce consistent direction (e.g., smaller ID as source)
    if (d.source_id > d.target_id) {
      // Swap source and target
      return {
        source: {
          id: d.target_id,
          start: parseInt(d.target_breakpoint) - 2000000,
          end: parseInt(d.target_breakpoint) + 2000000,
        },
        target: {
          id: d.source_id,
          start: parseInt(d.source_breakpoint) - 2000000,
          end: parseInt(d.source_breakpoint) + 2000000,
        },
        originalDirection: false, // Track swapped connections
      };
    } else {
      return {
        source: {
          id: d.source_id,
          start: parseInt(d.source_breakpoint) - 2000000,
          end: parseInt(d.source_breakpoint) + 2000000,
        },
        target: {
          id: d.target_id,
          start: parseInt(d.target_breakpoint) - 2000000,
          end: parseInt(d.target_breakpoint) + 2000000,
        },
        originalDirection: true, // Track original connections
      };
    }
  });

  // Define the layout with consistent radii
  circos
    .layout(GRCh37, {
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      labels: {
        radialOffset: 150, // Significantly increased offset for more space
        size: 25, // Larger font size for labels
        color: '#000', // Black label color for better readability
      },
      ticks: {
        display: true,
        labelDenominator: 1000000,
        size: 20, // Larger font size for numbering
      },
      events: {
        'click.demo': function (d, i, nodes, event) {
          console.log('Clicked on layout block:', d, event);
        },
      },
    })
    // Highlight cytobands with increased width
    .highlight('cytobands', cytobands, {
      innerRadius: innerRadius,
      outerRadius: outerRadius, // Increased the outer radius for wider cytobands
      opacity: 0.3,
      color: function (d) {
        return gieStainColor[d.gieStain];
      },
      tooltipContent: function (d) {
        return d.name;
      },
    })
    // Render chords with consistent radii
    .chords('l1', data, {
      radius: innerRadius, // Ensure ribbons touch the inner radius of the cytobands
      logScale: false,
      opacity: 0.7,
      color: function (d) {
        // Different colors for original vs. swapped direction
        return d.originalDirection ? '#ff5722' : '#4caf50'; // Orange for original, green for swapped
      },
      tooltipContent: function (d) {
        // Only display source and target IDs
        return (
          '<h3>' +
          d.source.id +
          ' ➤ ' +
          d.target.id +
          '</h3><br><i>(CTRL+C to copy to clipboard)</i>'
        );
      },
      events: {
        'mouseover.demo': function (d, i, nodes, event) {
          console.log(d, i, nodes, event.pageX);
        },
      },
    })
    .render();
};

// Queue and load data
d3.queue()
  .defer(d3.json, 'GRCh37.json') // Genome layout
  .defer(d3.csv, 'cytobands.csv') // Cytobands
  .defer(d3.csv, 'fusion-genes.csv') // Fusion gene connections
  .await(drawCircos);
