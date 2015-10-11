var

  game = new Phaser.Game(640, 480, Phaser.AUTO, 'OutCloned', { preload: preload, create: create, update: update, render: render }),
  ready = false,
  facing = "right",
  mapdata = [],
  groups = [],
  platforms,
  entities,
  clones,
  maxclones,
  cloneStartPosition,
  cursors;



function preload () {
  game.load.spritesheet('clone','js/game/assets/clone.png', 16, 16, 6);
  game.load.image('ground', 'js/game/assets/ground1.png');
  game.load.image('clone', 'js/game/assets/clone.png');
  game.load.image('cloner', 'js/game/assets/cloner.png');
  game.load.image('exit', 'js/game/assets/exit.png');
}

function createGroups() {

  platforms = game.add.group();
  platforms.enableBody = true;
  entities = game.add.group();
  entities.enableBody = true;
  clones = game.add.group();
  clones.enableBody = true;
}

function createClone() {
  var clone = clones.create(cloneStartPosition.x, cloneStartPosition.y, 'clone', 16, 16);
  clone.frame=1;
  clone.scale.setTo(2, 2);
  clone.animations.add('jump-right', [3], 20, true);
  clone.animations.add('jump-left', [2], 20, true);
  clone.animations.add('right', [3, 4, 3], 16, true);
  clone.animations.add('left', [0, 1, 2], 16, true);

  game.physics.enable(clone, Phaser.Physics.ARCADE);
  clone.body.gravity.y = 400;
  clone.body.bounce.y = 0.1;
  clone.body.bounce.x = 0.2;
  clone.body.velocity.y = -250;
  clone.body.collideWorldBounds = true;
}

function create () {

  game.physics.startSystem(Phaser.Physics.ARCADE);
  //game.physics.arcade.gravity.y = 250;
  createGroups();
  createLevel([9,9,
    2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,9,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,
    0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,9,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,
    0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,9,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,
    0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,
    3,9,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
  ]);
  maxclones = 10;
  Bullet.on('level.ready', function (startPos) {
    try {
      cloneStartPosition = startPos;
      game.time.events.repeat(Phaser.Timer.SECOND * 2, maxclones, createClone, this);
      ready = true;
    } catch (err) {
      setTimeout(function () {
        Bullet.trigger('level.ready', startPos);
      });
    }
  });
  cursors = game.input.keyboard.createCursorKeys();

}


function testCollisions () {
  game.physics.arcade.collide(clones, platforms);
  game.physics.arcade.collide(clones, clones);
  game.physics.arcade.overlap(clones, clones, function (a, b) {
    if (a !== b) {
      a.body.velocity.x = -300;
      b.body.velocity.x = 300;
    }
  }, null, this);
}


function iterateClones (cb) {
  //console.time('iterate');
  clones.iterate('exists', true, 'RETURN_NONE', function (clone) {
    cb(clone);
  });
  //console.timeEnd('iterate');
}

function eachClones (cb) {
  //console.time('each');
  _(clones.children).each(function (clone) {
    cb(clone);
  });
  //console.timeEnd('each');
}

function animateAllClones (anim) {
  eachClones(function (clone) {
    clone.animations.play(anim);
  })
}

function setFrameForAllClones (frame) {
  eachClones(function (clone) {
    clone.frame = frame;
  })
}

function controlClones () {
  //var onEachClone = iterateClones;
  //var onEachClone = eachClones;

  var clone = clones.getFirstExists

  onEachClone(function (clone) {

    if (cursors.left.isDown) {
      clone.body.velocity.x = -150;
      if (facing !== "left") {
        facing = "left";
        animateAllClones('left');
      }
    } else if (cursors.right.isDown) {
      clone.body.velocity.x = 150;
      if (facing !== "right") {
        facing = "right";
        animateAllClones('right');
      }
    } else if (clone.body.touching.down) {
      if (Math.abs(clone.body.velocity.x) > 10) {
        clone.body.velocity.x *= 0.66;
      } else {
        clone.body.velocity.x = 0;
      }
      if (facing === "left") {
        clone.frame = 1;
      } else if (facing === "right") {
        try {
          clone.frame = 4;
        } catch (er) {
          clone.frame = 0;
        }
      }
    }
    if (cursors.up.isDown && clone.body.touching.down) {
      if (clone.body.touching.down) {
          clone.body.velocity.y = -250;
      }
    }
    if (!clone.body.touching.down) {
      var jumpAnimation = facing === "left" ? "jump-left" : "jump-right";
      clone.animations.play(jumpAnimation);
    }
  });
}


function update () {
  if (ready) {
    testCollisions();
    try {
      controlClones();
    } catch (er) {
      // do nothing
    }

  }
}


function render () {

}
