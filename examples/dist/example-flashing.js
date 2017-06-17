(function () {
'use strict';

/*
var grid;
var data = [];
var columns = [
  {id: "server", name: "Server", field: "server", width: 180}
];
var currentServer;

function cpuUtilizationFormatter(row, cell, value, columnDef, dataContext) {
  if (value > 90) {
    return "<span class='load-hi'>" + value + "%</span>";
  }
  else if (value > 70) {
    return "<span class='load-medium'>" + value + "%</span>";
  }
  else {
    return value + "%";
  }
}

for (var i = 0; i < 4; i++) {
  columns.push({
    id: "cpu" + i,
    name: "CPU" + i,
    field: i,
    width: 80,
    formatter: cpuUtilizationFormatter
  });
}

var options = {
  editable: false,
  enableAddRow: false,
  enableCellNavigation: true,
  cellHighlightCssClass: "changed",
  cellFlashingCssClass: "current-server"
};

$(function () {
  for (var i = 0; i < 500; i++) {
    var d = (data[i] = {});
    d.server = "Server " + i;
    for (var j = 0; j < columns.length; j++) {
      d[j] = Math.round(Math.random() * 100);
    }
  }

  grid = new Slick.Grid("#myGrid", data, columns, options);

  currentServer = Math.round(Math.random() * (data.length - 1));
});

function simulateRealTimeUpdates() {
  var changes = {};
  var numberOfUpdates = Math.round(Math.random() * (data.length / 10));
  for (var i = 0; i < numberOfUpdates; i++) {
    var server = Math.round(Math.random() * (data.length - 1));
    var cpu = Math.round(Math.random() * (columns.length - 1));
    var delta = Math.round(Math.random() * 50) - 25;
    var col = grid.getColumnIndex("cpu" + cpu);
    var val = data[server][col] + delta;
    val = Math.max(0, val);
    val = Math.min(100, val);

    data[server][col] = val;

    if (!changes[server]) {
      changes[server] = {};
    }

    changes[server]["cpu" + cpu] = "changed";

    grid.invalidateRow(server);
  }

  grid.setCellCssStyles("highlight", changes);
  grid.render();

  setTimeout(simulateRealTimeUpdates, 500);
}

function findCurrentServer() {
  grid.scrollRowIntoView(currentServer);
  grid.flashCell(currentServer, grid.getColumnIndex("server"), 100);
}

flashCell(row, cell, speed) {
  speed = speed || 100
  if (this.rowsCache[row]) {
    var $cell = $(this.getCellNode(row, cell)!)

    var toggleCellClass = (times) => {
      if (!times) {
        return
      }
      setTimeout(() => {
          $cell.queue(() => {
            $cell.toggleClass(this.options.cellFlashingCssClass).dequeue()
            toggleCellClass(times - 1)
          })
        },
        speed)
    }

    toggleCellClass(4)
  }
}
*/

}());
