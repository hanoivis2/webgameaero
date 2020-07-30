var Math = Stage.Math;

// Game logic

function World() {
  this.objects = [];
  this.running = false;
}

World.prototype.add = function(obj) {
  this.objects.push(obj);
  obj.added(this);
};

World.prototype.remove = function(obj) {

  for (var i = 0; i < this.objects.length; i++) {
    if (this.objects[i] == obj) {
      this.objects.splice(i, 1);
    }
  }
  obj.removed(this);
};

World.prototype.size = function(width, height) {
  this.width = width;
  this.height = height;
  this.xMin = -(this.xMax = this.width / 2);
  this.yMin = -(this.yMax = this.height / 2);
  return this;
};

World.prototype.run = function(run) {
  this.running = run !== false;
};

World.prototype.tick = function(t) {
  if (this.running) {

    t = Math.min(100, t);
    for (var i = 0, n = this.objects.length; i < n; i++) {
      this.objects[i].tick(t);
    }
  }
};

function Drone(vMin, vMax, aMax) {
  this.x = 0;
  this.y = 0;
  this.vMin = vMin;
  this.vMax = vMax;
  this.aMax = aMax;
  this.vx = vMin;
  this.vy = 0;
  this.v = vMin;
  this.dir = 0;
  this.rotation = 0;
  this.accMain = 0;
  this.accSide = 0;
  this.accX = 0;
  this.accY = 0;
  this.accCX = null;
  this.accCY = null;
  this.uiCreate();
}

Drone.prototype.added = function(world) {
  this.world = world;
  this.uiAdd(world);
};

Drone.prototype.tick = function(t) {
  if (!t) {
    return;
  }

  var m = 0, n = 0;

  if (this.accCX !== null && this.accCY !== null) {
    var p = this.x - this.accCX;
    var q = this.y - this.accCY;
    var inn = p * this.vx + q * this.vy;
    var out = p * this.vy - q * this.vx;
    var b = out * 2 / t;
    var v2 = this.v * this.v;
    var d = b * b - 4 * v2 * (v2 + inn * 2 / t);
    if (d >= 0) {
      d = Math.sqrt(d);
      var m1 = (b - d) / 2 / v2 * this.v / t;
      var m2 = (-b - d) / 2 / v2 * this.v / t;
      m = Math.abs(m1) <= Math.abs(m2) ? -m1 : m2;
    }
    // var x = this.accCY - this.y;
    // var y = -(this.accCX - this.x);
    // var out = x * this.vy - y * this.vx;
    // var inn = x * this.vx + y * this.vy;
    // if (out < 0) {
    // m = out / inn / t / (this.aMax / this.v);
    // }

  } else if (this.accX !== 0 || this.accY !== 0) {
    var x = this.accX;
    var y = this.accY;
    var d = Math.length(x, y);
    m = (x * this.vy - y * this.vx) / this.v / d * this.aMax;

  } else if (this.accMain !== 0 || this.accSide !== 0) {
    n = this.accMain * 0.001;
    m = this.accSide * this.aMax;
  }

  if (m || n) {
    m = Math.limit(m, -this.aMax, this.aMax);
    m = m / this.v;

    this.vx += +this.vx * n * t;
    this.vy += +this.vy * n * t;

    this.vx += +this.vy * m * t;
    this.vy += -this.vx * m * t;

    var v = Math.length(this.vx, this.vy);
    this.v = Math.limit(v, this.vMin, this.vMax);
    v = this.v / v;
    this.vx *= v;
    this.vy *= v;

    var dir = Math.atan2(this.vy, this.vx);
    this.rotation = (this.rotation * (200 - t) + Math.rotate(this.dir - dir,
        -Math.PI, Math.PI)) / 200;
    this.dir = dir;

  } else {
    this.rotation = (this.rotation * (200 - t)) / 200;
  }

  this.x = Math.rotate(this.x + this.vx * t, this.world.xMin, this.world.xMax);
  this.y = Math.rotate(this.y + this.vy * t, this.world.yMin, this.world.yMax);

  this.uiUpdate();
};

function Enemy(vMin, vMax, aMax) {
  this.x = 0;
  this.y = 0;
  this.vMin = vMin;
  this.vMax = vMax;
  this.aMax = aMax;
  this.vx = vMin;
  this.vy = 0;
  this.v = vMin;
  this.dir = 0;
  this.rotation = 0;
  this.accMain = 0;
  this.accSide = 0;
  this.accX = 0;
  this.accY = 0;
  this.accCX = null;
  this.accCY = null;
  this.uiCreate();
}

Enemy.prototype.added = function(world) {
  this.world = world;
  this.uiAdd(world);
};

Enemy.prototype.removed = function(world) {
  this.uiRemove();
};

Enemy.prototype.tick = function(t) {
  if (!t) {
    return;
  }

  var m = 0, n = 0;

  this.x = Math.rotate(this.x + this.vx * t, this.world.xMin, this.world.xMax);
  this.y = Math.rotate(this.y + this.vy * t, this.world.yMin, this.world.yMax);
  

  this.uiUpdate();
};

// UI

Stage(function(stage) {

  var Mouse = Stage.Mouse;
  
  stage.viewbox(300, 300).pin('handle', -0.5);

  // Create game world
  var world = new World();
  world.ui = stage;

  var speed = 100 / 1000;
  var acc = speed * 2 / 1000;
  var drone = new Drone(speed, speed * 2, acc);
  var enemy1 = new Enemy(speed, speed * 2, acc);
  var enemy2 = new Enemy(speed, speed * 2, acc);
  var enemy3 = new Enemy(speed, speed * 2, acc);
  world.add(drone);
  world.add(enemy1);
  world.add(enemy2);
  world.add(enemy3);

  stage.on('viewport', function() {
    world.size(this.pin('width'), this.pin('height'));
    var x = Math.random(world.xMin, world.xMax);
    var y = Math.random(world.yMin, world.yMax);
    var angle = Math.random(-Math.PI, Math.PI);

    enemy1.x = x - 30;
    enemy1.y = y;
    enemy1.dir = angle;
    enemy1.vx = enemy1.v * Math.cos(angle);
    enemy1.vy = enemy1.v * Math.sin(angle);

    enemy2.x = x;
    enemy2.y = y;
    enemy2.dir = angle;
    enemy2.vx = enemy2.v * Math.cos(angle);
    enemy2.vy = enemy2.v * Math.sin(angle);

    enemy3.x = x + 30;
    enemy3.y = y;
    enemy3.dir = angle;
    enemy3.vx = enemy3.v * Math.cos(angle);
    enemy3.vy = enemy3.v * Math.sin(angle);

    enemy1.uiUpdate();
    enemy2.uiUpdate();
    enemy3.uiUpdate();
  });

  stage.tick(function(t) {

    // console.log(enemy2.x);

    if (enemy1.x >= world.xMax - 10 || enemy2.x >= world.xMax - 10 || enemy3.x >= world.xMax - 10) {
      var x = world.xMin + 50;
      var y = world.yMin + 50;
      var angle = Math.random(-Math.PI, Math.PI);

      enemy1.x = x - 30;
      enemy1.y = y;
      enemy1.dir = angle;
      enemy1.vx = enemy1.v * Math.cos(angle);
      enemy1.vy = enemy1.v * Math.sin(angle);

      enemy2.x = x;
      enemy2.y = y;
      enemy2.dir = angle;
      enemy2.vx = enemy2.v * Math.cos(angle);
      enemy2.vy = enemy2.v * Math.sin(angle);

      enemy3.x = x + 30;
      enemy3.y = y;
      enemy3.dir = angle;
      enemy3.vx = enemy3.v * Math.cos(angle);
      enemy3.vy = enemy3.v * Math.sin(angle);

    }
    else if (enemy1.y >= world.yMax - 10 || enemy2.y >= world.yMax - 10 || enemy3.y >= world.yMax - 10) {

      var x = world.xMin + 50;
      var y = world.yMin + 50;
      var angle = Math.random(-Math.PI, Math.PI);

      enemy1.x = x - 30;
      enemy1.y = y;
      enemy1.dir = angle;
      enemy1.vx = enemy1.v * Math.cos(angle);
      enemy1.vy = enemy1.v * Math.sin(angle);

      enemy2.x = x;
      enemy2.y = y;
      enemy2.dir = angle;
      enemy2.vx = enemy2.v * Math.cos(angle);
      enemy2.vy = enemy2.v * Math.sin(angle);

      enemy3.x = x + 30;
      enemy3.y = y;
      enemy3.dir = angle;
      enemy3.vx = enemy3.v * Math.cos(angle);
      enemy3.vy = enemy3.v * Math.sin(angle);

    }
    else if (enemy1.x <= world.xMin + 10 || enemy2.x <= world.xMin + 10 || enemy3.x <= world.xMin + 10) {

      var x = world.xMax + 50;
      var y = world.yMax + 50;
      var angle = Math.random(-Math.PI, Math.PI);

      enemy1.x = x - 30;
      enemy1.y = y;
      enemy1.dir = angle;
      enemy1.vx = enemy1.v * Math.cos(angle);
      enemy1.vy = enemy1.v * Math.sin(angle);

      enemy2.x = x;
      enemy2.y = y;
      enemy2.dir = angle;
      enemy2.vx = enemy2.v * Math.cos(angle);
      enemy2.vy = enemy2.v * Math.sin(angle);

      enemy3.x = x + 30;
      enemy3.y = y;
      enemy3.dir = angle;
      enemy3.vx = enemy3.v * Math.cos(angle);
      enemy3.vy = enemy3.v * Math.sin(angle);

    }
    else if (enemy1.y <= world.yMin + 10 || enemy2.y <= world.yMin + 10 || enemy3.y <= world.yMin + 10) {

      var x = world.yMax - 50;
      var y = world.yMax - 50;
      var angle = Math.random(-Math.PI, Math.PI);

      enemy1.x = x - 30;
      enemy1.y = y;
      enemy1.dir = angle;
      enemy1.vx = enemy1.v * Math.cos(angle);
      enemy1.vy = enemy1.v * Math.sin(angle);

      enemy2.x = x;
      enemy2.y = y;
      enemy2.dir = angle;
      enemy2.vx = enemy2.v * Math.cos(angle);
      enemy2.vy = enemy2.v * Math.sin(angle);

      enemy3.x = x + 30;
      enemy3.y = y;
      enemy3.dir = angle;
      enemy3.vx = enemy3.v * Math.cos(angle);
      enemy3.vy = enemy3.v * Math.sin(angle);

    }

    world.tick(t);
  });

  // Controls

  // Keyboard
  var keyboard = {
    down : function(keyCode) {
      this[keyCode] = true;
      this.update();
    },
    up : function(keyCode) {
      this[keyCode] = false;
      this.update();
    },
    update : function() {
      drone.accMain = this[38] ? +1 : this[40] ? -1 : 0;      //Speed
      drone.accSide = this[37] ? +1 : this[39] ? -1 : 0;      //Direction
      drone.accX = this[65] ? -1 : this[68] ? +1 : 0;         //Auto go to left or right
      drone.accY = this[87] ? -1 : this[83] ? +1 : 0;         //Auto go up or down
    }
  };
  document.onkeydown = function(e) {
    world.run(true);
    stage.touch();
    e = e || window.event;
    keyboard.down(e.keyCode);
  };
  document.onkeyup = function(e) {
    e = e || window.event;
    keyboard.up(e.keyCode);
  };

  // Mouse
  stage.on(Mouse.START, function(point) {
    world.run(true);
    stage.touch();
    tilt.watch(true);
    drone.accCX = point.x;
    drone.accCY = point.y;
  }).on(Mouse.END, function(point) {
    tilt.watch(false);
    drone.accCX = drone.accCY = null;
  }).on(Mouse.MOVE, function(point) {
    if (drone.accCX !== null && drone.accCY !== null) {
      drone.accCX = point.x;
      drone.accCY = point.y;
    }
  });

  // Tilting
  var tilt = {
    time : 0,
    watching : false,
    watch : function(watch) {
      this.time = 0;
      this.watching = !!watch;
    },
    update : function(a, b, g, o) {
      var now;
      if (!this.watching || (now = Date.now()) - this.time < 300) {
        return;
      }
      if (this.time === 0) {
        this.a0 = a, this.b0 = b, this.g0 = g;
        this.time = now;
        return;
      } else {
        this.a = a, this.b = b, this.g = g, this.o = o;
        this.time = now;
      }
      var x = Math.rotate(this.g - this.g0, -180, 180) / 180;
      var y = Math.rotate(this.b - this.b0, -180, 180) / 180;
      var min = 0.05;
      drone.accX = x > min ? 1 : x < -min ? -1 : 0;
      drone.accY = y > min ? 1 : y < -min ? -1 : 0;
      // console.log((a|0)+', '+(b|0)+', '+(g|0)+','+(o||'-'));
    }
  };
  window.addEventListener('deviceorientation', function(e) {
    return;
    tilt.update(e.alpha, e.beta, e.gamma, window.orientation);
  });
});

// Extending game logic and adding UI callbacks

Drone.prototype.uiCreate = function() {
  this.ui = Stage.create().pin('handle', 0.5);
  this.ui.drone = Stage.image('drone').pin('handle', 0.5).appendTo(this.ui);
  this.ui.shadow = Stage.image('drone').pin('handle', 0.5).pin({
    alpha : 0.2,
    offsetX : 30,
    offsetY : 30
  }).appendTo(this.ui);
  this.uiUpdate();
};

Drone.prototype.uiAdd = function(world) {
  this.ui.appendTo(world.ui);
};

Drone.prototype.uiRemove = function() {
  this.ui.remove();
};

Drone.prototype.uiUpdate = function() {
  this.ui.offset(this);
  var scaley = 1 - Math.abs(this.rotation) / Math.PI * 400;
  this.ui.drone.rotate(this.dir).scale(1, scaley);
  this.ui.shadow.rotate(this.dir).scale(1, scaley);
};

Enemy.prototype.uiCreate = function() {
  this.ui = Stage.create().pin('handle', 0.5);
  this.ui.drone = Stage.image('enemy').pin('handle', 0.5).appendTo(this.ui);
  this.ui.shadow = Stage.image('enemy').pin('handle', 0.5).pin({
    alpha : 0.2,
    offsetX : 30,
    offsetY : 30
  }).appendTo(this.ui);
  this.uiUpdate();
};

Enemy.prototype.uiAdd = function(world) {
  this.ui.appendTo(world.ui);
};

Enemy.prototype.uiRemove = function() {
  this.ui.remove();
};

Enemy.prototype.uiUpdate = function() {
  this.ui.offset(this);
  var scaley = 1 - Math.abs(this.rotation) / Math.PI * 400;
  this.ui.drone.rotate(this.dir).scale(1, scaley);
  this.ui.shadow.rotate(this.dir).scale(1, scaley);
};

// Textures

Stage({
  image : {
    src : './main.png',
    ratio : 4
  },
  textures : {
    drone : {
      x : 0,
      y : 0,
      width : 16,
      height : 16
    },
    enemy : {
      x : 64,
      y : 0,
      width : 16,
      height : 16
    }
  }
});
