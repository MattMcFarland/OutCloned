var createLevel = function(data) {


  var gridy = 0,
      startx, starty,
      gridx = -1;
  _(data).each(function (tile, i) {
    gridx ++;
    if (!tile) return;

    if (tile === 9) {
      gridy ++;
      gridx = -1;
      return;
    }

    (function () {

      var
        x = gridx * 32,
        y = gridy * 32,
        make,
        type;


      type = (tile === 1 ? 'ground' : tile === 2 ? 'cloner' : tile === 3 ? 'exit' : '');


      if (tile === 1) {
        make = platforms.create(x, y, type);
        make.body.immovable = true;
        //console.log('platform object', make);
      } else if (tile === 2) {
        startx = x;
        starty = y;
      } else {
        make = entities.create(x, y, type);
      }





      mapdata.push(_.extend({
        x: x,
        y: y,
        type: type,
        index: i
      }, make));
    })();

  });
  setTimeout(function () {
    Bullet.trigger('level.ready', {x: startx, y: starty});
  }, 0)
};
